import { spawnSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import os from 'node:os'
import { BUDGETS, clearEvidence, loadEvidence } from './perf-evidence.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..')
const EVIDENCE_DIR = resolve(REPO_ROOT, 'docs', 'audits', 'evidence')
const ARTIFACT_FILE = resolve(EVIDENCE_DIR, 'perf-reference-evidence.json')

const DESKTOP_CONFIG = 'playwright.perf.config.ts'
const MOBILE_CONFIG = 'playwright.perf-mobile.config.ts'

// Reference specs that make up the accepted reference suite. Desktop specs run
// under the hardware-accelerated desktop config; the mobile-4G vitals spec runs
// under the mobile config.
const DESKTOP_SPECS = [
  'e2e/perf-ref-frame.spec.ts',
  'e2e/perf-ref-heap.spec.ts',
  'e2e/perf-ref-inp.spec.ts',
  'e2e/perf-gpu.spec.ts',
  'e2e/m8-perf-sample.spec.ts',
]
const MOBILE_SPECS = ['e2e/perf-ref-vitals.spec.ts']

const USAGE = `perf:reference — deterministic reference-profile performance evidence gate.

Usage:
  node scripts/perf-reference.mjs [--help] [--dry-run]

Options:
  --help       Show this help and exit.
  --dry-run    Validate config and print the plan without running the suite.

Environment:
  PERF_REF_SKIP_BUILD=1   Skip the production build step.
  PERF_REF_DRY_RUN=1      Same as --dry-run.

Behavior:
  1. Runs the production build (unless skipped).
  2. Runs the accepted reference suite (desktop + mobile-4G perf specs).
  3. Collects evidence, adds machine/commit/timestamp/command metadata.
  4. Rejects SwiftShader/software renderers for the release measurement.
  5. Compares results against binding budgets.
  6. Writes docs/audits/evidence/perf-reference-evidence.json.
  7. Exits 0 if all budgets pass and no software renderer, else 1.
`

function log(msg) {
  console.log(`[perf-reference] ${msg}`)
}

function run(cmd, args, opts = {}) {
  // On Windows, npm/npx are .cmd shims that spawnSync cannot exec directly
  // (EINVAL). Run them through cmd.exe /c so the .cmd shim resolves and the
  // exit code propagates. On POSIX, exec the binary directly.
  const isWin = process.platform === 'win32'
  const isNpmLike = cmd === 'npm' || cmd === 'npx'
  const bin = isWin && isNpmLike ? 'cmd.exe' : cmd
  const cmdArgs = isWin && isNpmLike ? ['/c', `${cmd}.cmd`, ...args] : args
  log(`> ${isWin && isNpmLike ? `${cmd}.cmd` : cmd} ${args.join(' ')}`)
  // Use stdio 'pipe' and forward output so a child writing to stderr (e.g. a
  // Vite chunk-size warning) does not cause the child to be killed on Windows
  // when the parent's stdout is itself piped (status would come back null).
  const res = spawnSync(bin, cmdArgs, { cwd: REPO_ROOT, encoding: 'utf8', ...opts })
  if (res.stdout) process.stdout.write(res.stdout)
  if (res.stderr) process.stderr.write(res.stderr)
  if (res.status !== 0) {
    throw new Error(`command failed (exit ${res.status}): ${bin} ${cmdArgs.join(' ')}`)
  }
  return res
}

function gitHead() {
  const res = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: REPO_ROOT, encoding: 'utf8' })
  return res.status === 0 ? res.stdout.trim() : 'unknown'
}

function machineInfo() {
  const cpus = os.cpus()
  return {
    platform: os.platform(),
    release: os.release(),
    arch: os.arch(),
    cpuModel: cpus.length ? cpus[0].model : 'unknown',
    cpuCount: cpus.length,
    totalmemMB: Math.round(os.totalmem() / (1024 * 1024)),
    hostname: os.hostname(),
  }
}

/** Extract a Chrome/Chromium version from a user-agent string, if present. */
function browserVersionFromUA(ua) {
  if (!ua) return 'unknown'
  const m = ua.match(/Chrome\/(\d+\.\d+\.\d+\.\d+)/)
  return m ? m[1] : 'unknown'
}

function isSoftwareRenderer(unmaskedRenderer) {
  if (!unmaskedRenderer) return false
  return /swiftshader|llvmpipe|software/i.test(unmaskedRenderer)
}

function checkBudget(name, value, budget) {
  const pass = typeof value === 'number' && value <= budget
  return { name, value, budget, pass }
}

function main() {
  const args = process.argv.slice(2)
  const help = args.includes('--help')
  const dryRun = args.includes('--dry-run') || process.env.PERF_REF_DRY_RUN === '1'
  const skipBuild = process.env.PERF_REF_SKIP_BUILD === '1'

  if (help) {
    console.log(USAGE)
    process.exit(0)
  }

  log(`reference-profile performance evidence gate`)
  log(`repo root: ${REPO_ROOT}`)
  log(`desktop config: ${DESKTOP_CONFIG} (${DESKTOP_SPECS.length} specs)`)
  log(`mobile config: ${MOBILE_CONFIG} (${MOBILE_SPECS.length} specs)`)

  if (dryRun) {
    log('DRY RUN — no suite executed. Plan:')
    log(`  1. build: ${skipBuild ? 'SKIPPED (PERF_REF_SKIP_BUILD=1)' : 'npm run build'}`)
    log(`  2. desktop: npx playwright test --config=${DESKTOP_CONFIG} ${DESKTOP_SPECS.join(' ')}`)
    log(`  3. mobile:  npx playwright test --config=${MOBILE_CONFIG} ${MOBILE_SPECS.join(' ')}`)
    log(`  4. write artifact: ${ARTIFACT_FILE}`)
    log('DRY RUN complete — config valid.')
    process.exit(0)
  }

  // 1. Production build.
  if (skipBuild) {
    log('skipping build (PERF_REF_SKIP_BUILD=1)')
  } else {
    log('running production build...')
    run('npm', ['run', 'build'])
  }

  // 2. Run the reference suite. The Playwright configs own the preview server
  //    (webServer), so no separate server launch is needed here.
  clearEvidence()
  log('running desktop reference specs...')
  run('npx', ['playwright', 'test', `--config=${DESKTOP_CONFIG}`, ...DESKTOP_SPECS])
  log('running mobile-4G reference specs...')
  run('npx', ['playwright', 'test', `--config=${MOBILE_CONFIG}`, ...MOBILE_SPECS])

  // 3. Collect evidence and add metadata.
  const evidence = loadEvidence()
  const command = `node scripts/perf-reference.mjs ${args.join(' ')}`.trim()
  const config = { desktop: DESKTOP_CONFIG, mobile: MOBILE_CONFIG }
  const machine = machineInfo()
  const browserVersion = browserVersionFromUA(evidence.browser?.userAgent)
  const unmaskedRenderer = evidence.gpu?.unmaskedRenderer ?? evidence.gpu?.renderer ?? ''
  const swiftshaderRejected = isSoftwareRenderer(unmaskedRenderer)

  const artifact = {
    schema: 'perf-reference-evidence/v1',
    commitSha: gitHead(),
    timestamp: new Date().toISOString(),
    command,
    config,
    browserVersion,
    machine,
    gpu: evidence.gpu ?? null,
    swiftshaderRejected,
    frame: evidence.frame ?? null,
    vitals: evidence.vitals ?? null,
    heap: evidence.heap ?? null,
    interaction: evidence.interaction ?? null,
    longTasks: evidence.longTasks ?? null,
    budgets: BUDGETS,
  }

  // 4. Compute pass/fail against binding budgets.
  const checks = []
  if (artifact.frame?.aggregateP95 != null) {
    checks.push(checkBudget('frameP95Ms', artifact.frame.aggregateP95, BUDGETS.frameP95Ms))
  }
  if (artifact.vitals?.lcpP75 != null) {
    checks.push(checkBudget('lcpP75Ms', artifact.vitals.lcpP75, BUDGETS.lcpP75Ms))
  }
  if (artifact.vitals?.clsP75 != null) {
    checks.push(checkBudget('clsP75', artifact.vitals.clsP75, BUDGETS.clsP75))
  }
  if (artifact.interaction?.p75 != null) {
    checks.push(checkBudget('interactionP75Ms', artifact.interaction.p75, BUDGETS.interactionP75Ms))
  }
  if (artifact.heap?.afterMB != null) {
    checks.push(checkBudget('heapMB', artifact.heap.afterMB, BUDGETS.heapMB))
  }
  if (artifact.gpu?.textureMemoryMB != null) {
    checks.push(checkBudget('gpuTextureMB', artifact.gpu.textureMemoryMB, BUDGETS.gpuTextureMB))
  }
  if (artifact.longTasks?.over200 != null) {
    checks.push(checkBudget('longTasksOver200', artifact.longTasks.over200, BUDGETS.longTasksOver200))
  }
  if (artifact.longTasks?.over50 != null) {
    checks.push(checkBudget('longTasksOver50', artifact.longTasks.over50, BUDGETS.longTasksOver50))
  }

  artifact.checks = checks
  artifact.allBudgetsPass = checks.every((c) => c.pass)

  // 5. Write the final artifact.
  mkdirSync(EVIDENCE_DIR, { recursive: true })
  writeFileSync(ARTIFACT_FILE, JSON.stringify(artifact, null, 2))
  log(`evidence artifact written: ${ARTIFACT_FILE}`)

  // 6. Summary table.
  console.log('\n[perf-reference] budget summary')
  console.log('  ' + ['metric', 'value', 'budget', 'pass'].join('\t'))
  for (const c of checks) {
    console.log(`  ${c.name}\t${c.value}\t${c.budget}\t${c.pass ? 'PASS' : 'FAIL'}`)
  }
  console.log(`  swiftshaderRejected\t${swiftshaderRejected ? 'yes (INVALID)' : 'no'}\t-\t${swiftshaderRejected ? 'FAIL' : 'PASS'}`)

  // 7. Exit code.
  const ok = artifact.allBudgetsPass && !swiftshaderRejected
  if (ok) {
    log('ALL BUDGETS PASS — reference profile valid.')
    process.exit(0)
  } else {
    log('BUDGET FAILURE(S) OR SOFTWARE RENDERER — reference profile INVALID.')
    process.exit(1)
  }
}

main()
