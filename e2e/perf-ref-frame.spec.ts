import { test, expect } from '@playwright/test'
import { recordEvidence, writeRawSamples } from '../scripts/perf-evidence.mjs'

/**
 * Reference-profile frame-time gate per the accepted methodology in external
 * review 5134770762 (and re-audit 5136245139) plus audit 5148848138
 * (P1-FINAL-3):
 *   - production build
 *   - reference hardware (recorded machine)
 *   - 10s warm-up
 *   - 3 independent 60s traces
 *   - REAL representative navigation during each trace (not an idle camera)
 *   - retain raw frame-time samples per run, SEGMENTED BY RUN
 *   - report p95 per run and actual per-run trace duration + sample count
 *   - concatenate ALL raw samples and compute aggregate p95 over that set
 *   - budget p95 <= 20ms (NOT relaxed)
 *
 * The sampler self-terminates at a MONOTONIC deadline
 * (performance.now() + TRACE_MS) inside the rAF loop, INDEPENDENTLY of the
 * navigation driver: a navigation action begun near 60s (whose aria-current
 * await can overrun by up to 10s) can never stretch the trace past 60s,
 * because the sampler stops scheduling frames the moment its deadline is
 * reached. The navigation driver breaks out of the route loop on the same
 * monotonic clock, and stopSampler() is only a backstop.
 *
 * Raw samples are persisted segmented by run together with per-run durations
 * and counts, so every per-run p95 and the aggregate p95 are independently
 * recomputable by an auditor.
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
  // window global. The sampler SELF-TERMINATES at a monotonic deadline
  // (performance.now() + TRACE_MS), so a navigation await that overruns the
  // window can never stretch the trace beyond 60s: once the deadline is hit
  // the sampler stops scheduling new frames, independently of the test's
  // navigation driver. It records its own start/end timestamps so the actual
  // trace duration is measured from the sampler, not from wall-clock bookkeeping.
  const startSampler = () =>
    page.evaluate((traceMs) => {
      const w = window as unknown as {
        __frameSamples: number[]
        __sampling: boolean
        __sampleStart: number
        __sampleEnd: number
      }
      w.__frameSamples = []
      w.__sampling = true
      w.__sampleStart = performance.now()
      w.__sampleEnd = 0
      const deadline = w.__sampleStart + traceMs
      let last = w.__sampleStart
      function tick() {
        if (!w.__sampling) return
        const now = performance.now()
        w.__frameSamples.push(now - last)
        last = now
        if (now >= deadline) {
          w.__sampling = false
          w.__sampleEnd = now
          return
        }
        requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, TRACE_MS)

  const stopSampler = () =>
    page.evaluate(() => {
      const w = window as unknown as {
        __frameSamples: number[]
        __sampling: boolean
        __sampleStart: number
        __sampleEnd: number
      }
      w.__sampling = false
      const durationMs = w.__sampleEnd > 0 ? w.__sampleEnd - w.__sampleStart : null
      return { samples: w.__frameSamples, durationMs }
    })

  const allRunSamples: number[][] = []
  const runP95s: number[] = []
  const runDurationsMs: number[] = []
  const runSampleCounts: number[] = []

  for (let run = 0; run < TRACES; run++) {
    await startSampler()
    const traceStart = performance.now() // monotonic clock on the driver side

    // Drive real representative navigation for the full 60s trace: walk the
    // route repeatedly, waiting for each camera walk to complete (aria-current
    // flips to the selected landmark) before the next click. Break out of the
    // route loop as soon as the trace deadline is reached. Even if a click's
    // aria-current await overruns the deadline, the page sampler has already
    // self-terminated at its own monotonic deadline, so the trace stays a
    // literal 60s (±1 frame).
    outer: while (performance.now() - traceStart < TRACE_MS) {
      for (const label of ROUTE) {
        if (performance.now() - traceStart >= TRACE_MS) break outer
        await nav.getByRole('button', { name: label, exact: true }).click()
        await expect(nav.getByRole('button', { name: label, exact: true })).toHaveAttribute('aria-current', 'location', {
          timeout: 10_000,
        })
        if (label === 'Central Atrium') await dismissGreeting()
      }
    }

    // Backstop stop: the sampler normally already stopped at its deadline, so
    // calling stopSampler() here cannot extend the trace.
    const { samples: raw, durationMs } = await stopSampler()
    const sorted = [...raw].sort((a, b) => a - b)
    const p95 = sorted[Math.floor(sorted.length * 0.95)]
    const avgFps = 1000 / (raw.reduce((a, b) => a + b, 0) / raw.length)
    runP95s.push(p95)
    runSampleCounts.push(raw.length)
    runDurationsMs.push(durationMs ?? performance.now() - traceStart)
    allRunSamples.push(raw)
    console.log(
      `[perf-ref-frame] run=${run + 1}/${TRACES} p95FrameMs=${p95.toFixed(2)} avgFps=${avgFps.toFixed(1)} frames=${raw.length} durationMs=${runDurationsMs[run].toFixed(0)}`,
    )
  }

  // Aggregate p95 over the CONCATENATED raw sample set (all runs), per the
  // accepted methodology — not over the per-run p95 values.
  const allRawSamples = allRunSamples.flat()
  const allSorted = [...allRawSamples].sort((a, b) => a - b)
  const aggregateP95 = allSorted[Math.floor(allSorted.length * 0.95)]
  console.log(
    `[perf-ref-frame] aggregate p95=${aggregateP95.toFixed(2)}ms totalSamples=${allRawSamples.length} runP95s=[${runP95s.map((r) => r.toFixed(2)).join(',')}]ms`,
  )
  console.log(
    `[perf-ref-frame] runDurationsMs=[${runDurationsMs.map((d) => d.toFixed(0)).join(',')}]ms runSampleCounts=[${runSampleCounts.join(',')}]`,
  )
  console.log(
    `[perf-ref-frame] referenceProfile viewport=${profile.viewport.w}x${profile.viewport.h} dpr=${profile.dpr} hwConcurrency=${profile.hardwareConcurrency} deviceMemory=${profile.deviceMemory} renderer=${profile.renderer}`,
  )
  console.log(
    '[perf-ref-frame] methodology=production build, REAL representative navigation during each 60s trace, 10s warm-up, ' +
      '3 independent 60s traces (monotonic self-terminating sampler), raw samples segmented by run + durations + counts, ' +
      'aggregate p95 over concatenated sample set; budget p95 <=20ms desktop (docs/architecture/PERFORMANCE_BUDGET.md); ' +
      'reference machine recorded in final handoff',
  )

  // Persist raw samples to a separate artifact (segmented by run, with per-run
  // durations and counts so each p95 is independently recomputable) and record
  // the evidence for the `perf:reference` orchestrator.
  const { file: rawSamplesFile, hash: rawSamplesHash } = writeRawSamples(allRunSamples, {
    runDurationsMs,
    runSampleCounts,
  })
  recordEvidence({
    frame: {
      runP95s,
      aggregateP95,
      totalSamples: allRawSamples.length,
      rawSamplesHash,
      rawSamplesFile,
      runDurationsMs,
      runSampleCounts,
    },
  })
})
