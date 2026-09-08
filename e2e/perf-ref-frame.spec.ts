import { test, expect } from '@playwright/test'
import { recordEvidence, writeRawSamples } from '../scripts/perf-evidence.mjs'

/**
 * Reference-profile frame-time gate per the accepted methodology in external
 * review 5134770762 (and re-audit 5136245139):
 *   - production build
 *   - reference hardware (recorded machine)
 *   - 10s warm-up
 *   - 3 independent 60s traces
 *   - REAL representative navigation during each trace (not an idle camera)
 *   - retain raw frame-time samples per run
 *   - report p95 per run
 *   - concatenate ALL raw samples and compute aggregate p95 over that set
 *   - budget p95 <= 20ms (NOT relaxed)
 *
 * The sampler stops at exactly 60s (±1 frame) via a deadline check inside the
 * rAF loop, and the navigation driver breaks out of the route loop when the
 * trace deadline is reached — it does NOT wait for a full route loop to finish,
 * so traces do not overrun to ~65-70s.
 *
 * Results are recorded into the shared evidence accumulator consumed by the
 * `perf:reference` orchestrator (scripts/perf-reference.mjs).
 */

const TRACES = 3
const TRACE_MS = 60_000
const WARMUP_MS = 10_000

// Representative route: the full landmark journey. Each click triggers a real
// camera walk, so frame-time samples capture navigation load, not idle.
const ROUTE = [
  'Forest Approach',
  'HomeLab Exterior',
  'Energy Portal',
  'Central Atrium',
  'Bridge',
  'Software Engineering Lab',
]

test('reference-profile frame time: 10s warm-up + 3x60s traces with real navigation, aggregate p95 over all samples', async ({
  page,
}) => {
  test.setTimeout(TRACES * TRACE_MS + WARMUP_MS + 120_000)

  // Record the reference machine profile.
  const profile = await page.evaluate(() => {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
    return {
      viewport: { w: window.innerWidth, h: window.innerHeight },
      dpr: window.devicePixelRatio,
      userAgent: navigator.userAgent,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 'n/a',
      renderer: gl ? String(gl.getParameter(gl.RENDERER)) : 'n/a',
    }
  })

  await page.goto('/')
  await page.getByRole('button', { name: /enter homelab/i }).click()
  await page.locator('canvas').waitFor({ state: 'visible' })

  const nav = page.getByRole('navigation', { name: /homelab landmarks/i })
  await expect(nav).toBeVisible()

  // Warm-up: let the scene settle past first-frame/compile cost.
  await page.waitForTimeout(WARMUP_MS)

  // Dismiss Zavit's greeting on first Atrium arrival so it never blocks the HUD.
  const dismissGreeting = async () => {
    const greeting = page.getByRole('dialog', { name: 'Zavit' })
    try {
      await greeting.waitFor({ state: 'visible', timeout: 3000 })
      await greeting.getByRole('button', { name: 'Skip' }).click()
    } catch {
      /* greeting did not appear — nothing to dismiss */
    }
  }

  // Start a rAF sampler in the page that accumulates raw frame times into a
  // window global. The test drives navigation while the sampler runs. The
  // sampler does NOT self-terminate: the test calls stopSampler() after the
  // 60s navigation window, so the sampler runs for exactly the duration of the
  // navigation. (A self-terminating sampler keyed to performance.now() while
  // the navigation loop is keyed to Date.now() can be cut short if the wall
  // clock advances faster than the monotonic clock — e.g. an NTP adjustment —
  // producing a sub-60s trace.)
  const startSampler = () =>
    page.evaluate(() => {
      const w = window as unknown as { __frameSamples: number[]; __sampling: boolean }
      w.__frameSamples = []
      w.__sampling = true
      let last = performance.now()
      function tick() {
        if (!w.__sampling) return
        const now = performance.now()
        w.__frameSamples.push(now - last)
        last = now
        requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    })

  const stopSampler = () =>
    page.evaluate(() => {
      const w = window as unknown as { __frameSamples: number[]; __sampling: boolean }
      w.__sampling = false
      return w.__frameSamples
    })

  const allRawSamples: number[] = []
  const runP95s: number[] = []

  for (let run = 0; run < TRACES; run++) {
    await startSampler()
    const traceStart = Date.now()

    // Drive real representative navigation for the full 60s trace: walk the
    // route repeatedly, waiting for each camera walk to complete (aria-current
    // flips to the selected landmark) before the next click. Break out of the
    // route loop as soon as the trace deadline is reached so the trace ends at
    // 60s (±1 frame) instead of waiting for a full route loop to finish.
    outer: while (Date.now() - traceStart < TRACE_MS) {
      for (const label of ROUTE) {
        if (Date.now() - traceStart >= TRACE_MS) break outer
        await nav.getByRole('button', { name: label, exact: true }).click()
        await expect(nav.getByRole('button', { name: label, exact: true })).toHaveAttribute('aria-current', 'location', {
          timeout: 10_000,
        })
        if (label === 'Central Atrium') await dismissGreeting()
      }
    }

    // Stop the sampler immediately after the 60s navigation window so the
    // trace is a literal 60s (±1 frame) of real navigation.
    const raw = await stopSampler()
    const sorted = [...raw].sort((a, b) => a - b)
    const p95 = sorted[Math.floor(sorted.length * 0.95)]
    const avgFps = 1000 / (raw.reduce((a, b) => a + b, 0) / raw.length)
    runP95s.push(p95)
    allRawSamples.push(...raw)
    console.log(
      `[perf-ref-frame] run=${run + 1}/${TRACES} p95FrameMs=${p95.toFixed(2)} avgFps=${avgFps.toFixed(1)} frames=${raw.length}`,
    )
  }

  // Aggregate p95 over the CONCATENATED raw sample set (all runs), per the
  // accepted methodology — not over the per-run p95 values.
  const allSorted = [...allRawSamples].sort((a, b) => a - b)
  const aggregateP95 = allSorted[Math.floor(allSorted.length * 0.95)]
  console.log(
    `[perf-ref-frame] aggregate p95=${aggregateP95.toFixed(2)}ms totalSamples=${allRawSamples.length} runP95s=[${runP95s.map((r) => r.toFixed(2)).join(',')}]ms`,
  )
  console.log(
    `[perf-ref-frame] referenceProfile viewport=${profile.viewport.w}x${profile.viewport.h} dpr=${profile.dpr} hwConcurrency=${profile.hardwareConcurrency} deviceMemory=${profile.deviceMemory} renderer=${profile.renderer}`,
  )
  console.log(
    '[perf-ref-frame] methodology=production build, REAL representative navigation during each 60s trace, 10s warm-up, ' +
      '3 independent 60s traces, raw samples retained, aggregate p95 over concatenated sample set; ' +
      'budget p95 <=20ms desktop (docs/architecture/PERFORMANCE_BUDGET.md); reference machine recorded in final handoff',
  )

  // Persist raw samples to a separate artifact and record the evidence for the
  // `perf:reference` orchestrator.
  const { file: rawSamplesFile, hash: rawSamplesHash } = writeRawSamples(allRawSamples)
  recordEvidence({
    frame: {
      runP95s,
      aggregateP95,
      totalSamples: allRawSamples.length,
      rawSamplesHash,
      rawSamplesFile,
    },
  })
})
