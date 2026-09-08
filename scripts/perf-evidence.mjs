import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
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

/**
 * Write raw frame-time samples to the evidence dir and return the file path
 * plus its SHA-256 hash so the artifact can reference an immutable raw sample
 * set.
 */
export function writeRawSamples(samples) {
  mkdirSync(EVIDENCE_DIR, { recursive: true })
  const file = resolve(EVIDENCE_DIR, 'perf-frame-raw.json')
  const json = JSON.stringify(samples, null, 2)
  writeFileSync(file, json)
  return { file, hash: sha256(json) }
}
