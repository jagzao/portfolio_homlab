import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..')
const EVIDENCE_DIR = resolve(REPO_ROOT, 'docs', 'audits', 'evidence')
const TMP_FILE = resolve(REPO_ROOT, 'perf-evidence.tmp.json')

/**
 * Binding budgets for the reference-profile performance gate. Compared by the
 * `perf:reference` orchestrator (scripts/perf-reference.mjs) against the
 * evidence accumulated by the perf-ref-* specs. Mirrors
 * docs/architecture/PERFORMANCE_BUDGET.md.
 */
export const BUDGETS = {
  frameP95Ms: 20, // desktop p95 frame time <= 20ms
  lcpP75Ms: 2500, // mobile-4G LCP p75 <= 2.5s
  clsP75: 0.1, // mobile-4G CLS p75 <= 0.10
  interactionP75Ms: 200, // lab interaction latency p75 <= 200ms
  heapMB: 250, // literal 5-minute route desktop heap <= 250MB
  gpuTextureMB: 256, // GPU texture memory estimate <= 256MB desktop
  longTasksOver200: 0, // no long tasks > 200ms during entry
  longTasksOver50: 2, // at most 2 long tasks > 50ms during entry
}

/**
 * Required evidence schema for the fail-closed reference gate (external audit
 * 5148848138, P0-FINAL-3). `validateEvidence()` enforces these contracts:
 * `allBudgetsPass` must mean every required group is present, valid
 * (finite, non-negative, no -1 sentinel), complete (exact run counts) and —
 * only then — within budget. Documented here so the completeness contract is
 * reviewable independently of the enforcement code.
 */
export const REQUIRED_EVIDENCE = {
  note: 'Every field below is REQUIRED. Missing, non-finite, negative (-1 sentinel), incomplete-count, or software/unavailable-renderer evidence fails the gate closed.',
  frame: {
    runP95s: 'array of exactly 3 finite non-negative numbers (per-run p95 frame time ms)',
    aggregateP95: 'finite non-negative number (p95 over all concatenated raw samples)',
    totalSamples: 'positive integer (total raw frame samples across all runs)',
    rawSamplesHash: 'non-empty string (SHA-256 of the raw sample artifact)',
    rawSamplesFile: 'non-empty repo-relative path to the raw sample artifact',
    runDurationsMs: 'array of exactly 3 finite numbers > 0 (actual per-run trace duration ms)',
    runSampleCounts: 'array of exactly 3 positive integers (per-run raw sample counts)',
  },
  vitals: {
    lcpAll: 'array of exactly 10 finite non-negative numbers (LCP ms per clean-cache run; missing LCP is recorded as -1 and rejected)',
    clsAll: 'array of exactly 10 finite non-negative numbers (CLS per clean-cache run)',
    lcpP75: 'finite non-negative number',
    clsP75: 'finite non-negative number',
  },
  heap: {
    beforeMB: 'finite non-negative number',
    afterMB: 'finite non-negative number',
    deltaMB: 'finite number (may be negative) but never the -1 sentinel',
    growthMB: 'finite number (may be negative) but never the -1 sentinel',
    perPassMB: 'non-empty array of finite non-negative numbers (heap after each route pass)',
  },
  interaction: {
    values: 'array of >= 10 finite non-negative numbers (click-to-visible-effect ms)',
    p75: 'finite non-negative number',
  },
  longTasks: {
    count: 'integer >= 0',
    over50: 'integer >= 0',
    over200: 'integer >= 0',
    durations: 'array of finite non-negative numbers (may be empty when count is 0)',
  },
  gpu: {
    unmaskedRenderer: 'non-empty string; must NOT be a software renderer (SwiftShader/llvmpipe/software) or n/a/unknown',
    unmaskedVendor: 'non-empty string; must NOT be n/a/unknown',
    textures: 'integer >= 0 (scene traversal unavailable is recorded as -1 and rejected)',
    textureMemoryMB: 'finite non-negative number',
  },
}

/**
 * Read the shared evidence accumulator. Specs run in separate worker processes
 * (workers: 1), so each `recordEvidence` call persists the merged object to a
 * temp JSON file that the orchestrator reads back after the suite finishes.
 */
export function loadEvidence() {
  if (!existsSync(TMP_FILE)) return {}
  try {
    return JSON.parse(readFileSync(TMP_FILE, 'utf8'))
  } catch {
    return {}
  }
}

/**
 * Merge `partial` into the shared accumulator and persist it. Returns the
 * merged object.
 */
export function recordEvidence(partial) {
  const merged = { ...loadEvidence(), ...partial }
  writeFileSync(TMP_FILE, JSON.stringify(merged, null, 2))
  return merged
}

/** Reset the accumulator to an empty object (called by the orchestrator). */
export function clearEvidence() {
  writeFileSync(TMP_FILE, '{}')
}

/** SHA-256 hex digest of a string. */
export function sha256(text) {
  return createHash('sha256').update(text).digest('hex')
}

/** True when a WebGL renderer string is a known software rasterizer. */
export function isSoftwareRenderer(renderer) {
  if (!renderer) return false
  return /swiftshader|llvmpipe|software/i.test(renderer)
}

function isObject(v) {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function typeLabel(v) {
  if (v === null) return 'null'
  if (Array.isArray(v)) return 'array'
  return typeof v
}

function pushError(errors, path, message) {
  errors.push(`${path}: ${message}`)
}

/**
 * Validate a scalar number field. opts:
 *   nonNeg     reject values < 0
 *   positive   reject values <= 0
 *   noSentinel reject the -1 "missing/unavailable" sentinel (negative values
 *               other than -1 remain legal, e.g. heap delta/growth)
 */
function checkNumber(errors, path, value, opts = {}) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    pushError(errors, path, `expected a finite number, got ${typeLabel(value)}`)
    return false
  }
  if (opts.noSentinel && value === -1) {
    pushError(errors, path, `unavailable/missing value leaked as the -1 sentinel`)
    return false
  }
  if (opts.nonNeg && value < 0) {
    pushError(errors, path, `expected a non-negative number, got ${value}`)
    return false
  }
  if (opts.positive && value <= 0) {
    pushError(errors, path, `expected a positive number, got ${value}`)
    return false
  }
  return true
}

/**
 * Validate an integer field (default: non-negative integer).
 * opts: positive -> reject <= 0
 */
function checkInt(errors, path, value, { positive = false } = {}) {
  if (!Number.isInteger(value)) {
    pushError(errors, path, `expected an integer, got ${typeLabel(value)}`)
    return false
  }
  if (positive && value <= 0) {
    pushError(errors, path, `expected a positive integer, got ${value}`)
    return false
  }
  if (!positive && value < 0) {
    pushError(errors, path, `expected a non-negative integer, got ${value}`)
    return false
  }
  return true
}

/**
 * Validate an array of numbers. opts:
 *   len       exact required length
 *   minLen    minimum required length
 *   ...       remaining opts forwarded to checkNumber (nonNeg/positive/...)
 * A length mismatch is reported once; otherwise each element is checked.
 */
function checkNumberArray(errors, path, arr, { len = null, minLen = 0, ...numOpts } = {}) {
  if (!Array.isArray(arr)) {
    pushError(errors, path, `expected an array, got ${typeLabel(arr)}`)
    return false
  }
  if (len !== null && arr.length !== len) {
    pushError(errors, path, `expected exactly ${len} elements, got ${arr.length}`)
    return false
  }
  if (arr.length < minLen) {
    pushError(errors, path, `expected at least ${minLen} elements, got ${arr.length}`)
    return false
  }
  arr.forEach((v, i) => checkNumber(errors, `${path}[${i}]`, v, numOpts))
  return true
}

function checkNonEmptyString(errors, path, value) {
  if (typeof value !== 'string' || value.trim() === '') {
    pushError(errors, path, `expected a non-empty string, got ${typeLabel(value)}`)
    return false
  }
  return true
}

/** n/a / unknown / none are "could not read it" placeholders, never evidence. */
function checkNotPlaceholder(errors, path, value) {
  if (/^(n\/a|unknown|none)$/i.test(String(value).trim())) {
    pushError(errors, path, `placeholder "${value}" is not acceptable evidence`)
    return false
  }
  return true
}

/**
 * P0-FINAL-3: fail-closed schema validation for the reference evidence.
 * Returns { valid, errors }. `valid` is true only when every required group is
 * present with all required fields present, finite, non-negative (no -1
 * sentinel), complete counts, non-empty raw-sample references, and a hardware
 * (non-software, non-placeholder) unmasked renderer.
 */
export function validateEvidence(evidence) {
  const errors = []
  if (!isObject(evidence)) {
    pushError(errors, 'evidence', 'expected a non-null object of recorded metrics')
    return { valid: false, errors }
  }

  // Every group below is required; a missing group is a closed gate.
  const requiredGroup = (name) => {
    const groupValue = evidence[name]
    if (!isObject(groupValue)) {
      pushError(errors, name, 'required evidence group is missing')
      return null
    }
    return groupValue
  }

  // frame
  const frame = requiredGroup('frame')
  if (frame) {
    checkNumberArray(errors, 'frame.runP95s', frame.runP95s, { len: 3, nonNeg: true })
    checkNumber(errors, 'frame.aggregateP95', frame.aggregateP95, { nonNeg: true })
    checkInt(errors, 'frame.totalSamples', frame.totalSamples, { positive: true })
    checkNonEmptyString(errors, 'frame.rawSamplesHash', frame.rawSamplesHash)
    checkNonEmptyString(errors, 'frame.rawSamplesFile', frame.rawSamplesFile)
    checkNumberArray(errors, 'frame.runDurationsMs', frame.runDurationsMs, { len: 3, positive: true })
    if (!Array.isArray(frame.runSampleCounts)) {
      pushError(errors, 'frame.runSampleCounts', 'expected an array of exactly 3 positive integers')
    } else if (frame.runSampleCounts.length !== 3) {
      pushError(errors, 'frame.runSampleCounts', `expected exactly 3 elements, got ${frame.runSampleCounts.length}`)
    } else {
      frame.runSampleCounts.forEach((c, i) => checkInt(errors, `frame.runSampleCounts[${i}]`, c, { positive: true }))
    }
  }

  // vitals
  const vitals = requiredGroup('vitals')
  if (vitals) {
    checkNumberArray(errors, 'vitals.lcpAll', vitals.lcpAll, { len: 10, nonNeg: true })
    checkNumberArray(errors, 'vitals.clsAll', vitals.clsAll, { len: 10, nonNeg: true })
    checkNumber(errors, 'vitals.lcpP75', vitals.lcpP75, { nonNeg: true })
    checkNumber(errors, 'vitals.clsP75', vitals.clsP75, { nonNeg: true })
  }

  // heap
  const heap = requiredGroup('heap')
  if (heap) {
    checkNumber(errors, 'heap.beforeMB', heap.beforeMB, { nonNeg: true })
    checkNumber(errors, 'heap.afterMB', heap.afterMB, { nonNeg: true })
    checkNumber(errors, 'heap.deltaMB', heap.deltaMB, { noSentinel: true })
    checkNumber(errors, 'heap.growthMB', heap.growthMB, { noSentinel: true })
    checkNumberArray(errors, 'heap.perPassMB', heap.perPassMB, { minLen: 1, nonNeg: true })
  }

  // interaction
  const interaction = requiredGroup('interaction')
  if (interaction) {
    checkNumberArray(errors, 'interaction.values', interaction.values, { minLen: 10, nonNeg: true })
    checkNumber(errors, 'interaction.p75', interaction.p75, { nonNeg: true })
  }

  // longTasks
  const longTasks = requiredGroup('longTasks')
  if (longTasks) {
    checkInt(errors, 'longTasks.count', longTasks.count)
    checkInt(errors, 'longTasks.over50', longTasks.over50)
    checkInt(errors, 'longTasks.over200', longTasks.over200)
    checkNumberArray(errors, 'longTasks.durations', longTasks.durations, { nonNeg: true })
  }

  // gpu
  const gpu = requiredGroup('gpu')
  if (gpu) {
    checkNonEmptyString(errors, 'gpu.unmaskedRenderer', gpu.unmaskedRenderer)
    checkNotPlaceholder(errors, 'gpu.unmaskedRenderer', gpu.unmaskedRenderer)
    if (isSoftwareRenderer(gpu.unmaskedRenderer)) {
      pushError(errors, 'gpu.unmaskedRenderer', `software renderer "${gpu.unmaskedRenderer}" is not acceptable reference-profile evidence`)
    }
    checkNonEmptyString(errors, 'gpu.unmaskedVendor', gpu.unmaskedVendor)
    checkNotPlaceholder(errors, 'gpu.unmaskedVendor', gpu.unmaskedVendor)
    checkInt(errors, 'gpu.textures', gpu.textures)
    checkNumber(errors, 'gpu.textureMemoryMB', gpu.textureMemoryMB, { nonNeg: true })
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Write raw frame-time samples to the evidence dir, segmented by run so every
 * per-run and aggregate p95 in the artifact is independently recomputable, and
 * return a repo-relative file path plus the SHA-256 hash of the exact bytes
 * written. `runs` is an array of per-run sample arrays; `meta` (e.g.
 * runDurationsMs / runSampleCounts) is persisted alongside the samples.
 */
export function writeRawSamples(runs, meta = {}) {
  mkdirSync(EVIDENCE_DIR, { recursive: true })
  const absFile = resolve(EVIDENCE_DIR, 'perf-frame-raw.json')
  const json = JSON.stringify({ runs, ...meta }, null, 2)
  writeFileSync(absFile, json)
  const relFile = relative(REPO_ROOT, absFile).replaceAll('\\', '/')
  return { file: relFile, hash: sha256(json) }
}

/**
 * Physically verify the raw frame-sample artifact referenced by the evidence
 * artifact. Checks, in order:
 *   1. the raw file exists at the repo-relative path;
 *   2. its on-disk bytes SHA-256 match the recorded rawSamplesHash;
 *   3. it parses as JSON with the expected structure ({ runs, runDurationsMs,
 *      runSampleCounts });
 *   4. run count == 3, each run is a non-empty array of finite numbers, and
 *      runSampleCounts matches the actual per-run lengths;
 *   5. the per-run p95 recomputed from the raw samples match the recorded
 *      runP95s, and the aggregate p95 recomputed over the concatenated samples
 *      matches the recorded aggregateP95 (within a small float tolerance).
 *
 * Returns { valid, errors }. Any missing/corrupt/mismatched raw evidence is a
 * closed gate (fail-closed), per the external audit.
 */
export function verifyRawEvidence(frame) {
  const errors = []
  if (!frame || !isObject(frame)) {
    return { valid: false, errors: ['frame: required evidence group is missing'] }
  }
  const relFile = frame.rawSamplesFile
  if (typeof relFile !== 'string' || relFile.trim() === '') {
    return { valid: false, errors: ['frame.rawSamplesFile: missing raw sample path'] }
  }
  const absFile = resolve(REPO_ROOT, relFile)
  if (!existsSync(absFile)) {
    return { valid: false, errors: [`frame.rawSamplesFile: raw artifact not found at ${relFile}`] }
  }
  let rawText
  try {
    rawText = readFileSync(absFile, 'utf8')
  } catch (e) {
    return { valid: false, errors: [`frame.rawSamplesFile: cannot read raw artifact: ${e.message}`] }
  }
  // 2. SHA-256 of the exact on-disk bytes.
  const diskHash = sha256(rawText)
  if (frame.rawSamplesHash !== diskHash) {
    return {
      valid: false,
      errors: [`frame.rawSamplesHash: mismatch — recorded ${frame.rawSamplesHash}, on-disk ${diskHash}`],
    }
  }
  // 3. Parse + structure.
  let raw
  try {
    raw = JSON.parse(rawText)
  } catch (e) {
    return { valid: false, errors: [`frame.rawSamplesFile: raw artifact is not valid JSON: ${e.message}`] }
  }
  if (!isObject(raw) || !Array.isArray(raw.runs)) {
    return { valid: false, errors: ['frame.rawSamplesFile: raw artifact missing runs array'] }
  }
  if (raw.runs.length !== 3) {
    return { valid: false, errors: [`frame.rawSamplesFile: expected 3 runs, got ${raw.runs.length}`] }
  }
  // 4. Per-run counts + finite samples.
  const counts = raw.runs.map((run) => {
    if (!Array.isArray(run) || run.length === 0) return 0
    for (const s of run) {
      if (typeof s !== 'number' || !Number.isFinite(s)) return -1
    }
    return run.length
  })
  if (counts.some((c) => c === -1)) {
    return { valid: false, errors: ['frame.rawSamplesFile: a run contains a non-finite sample'] }
  }
  if (counts.some((c) => c === 0)) {
    return { valid: false, errors: ['frame.rawSamplesFile: a run is empty'] }
  }
  if (frame.runSampleCounts?.length !== 3 || counts.some((c, i) => c !== frame.runSampleCounts[i])) {
    return {
      valid: false,
      errors: [`frame.rawSamplesFile: runSampleCounts mismatch — recorded ${JSON.stringify(frame.runSampleCounts)}, actual ${JSON.stringify(counts)}`],
    }
  }
  // 5. Recompute per-run p95 and aggregate p95.
  const p95 = (arr) => {
    const sorted = [...arr].sort((a, b) => a - b)
    return sorted[Math.floor(sorted.length * 0.95)]
  }
  const recomputedRunP95s = raw.runs.map(p95)
  const recomputedAggregate = p95(raw.runs.flat())
  const TOL = 0.5 // ms float tolerance
  const runMatch = recomputedRunP95s.every((v, i) => Math.abs(v - frame.runP95s[i]) <= TOL)
  if (!runMatch) {
    return {
      valid: false,
      errors: [`frame.rawSamplesFile: per-run p95 mismatch — recorded ${JSON.stringify(frame.runP95s)}, recomputed ${JSON.stringify(recomputedRunP95s.map((v) => v.toFixed(2)))}`],
    }
  }
  if (Math.abs(recomputedAggregate - frame.aggregateP95) > TOL) {
    return {
      valid: false,
      errors: [`frame.rawSamplesFile: aggregate p95 mismatch — recorded ${frame.aggregateP95}, recomputed ${recomputedAggregate.toFixed(2)}`],
    }
  }
  return { valid: true, errors }
}
