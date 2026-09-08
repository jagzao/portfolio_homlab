import { test } from '@playwright/test'

/**
 * Reference-profile performance gate per the accepted methodology in external
 * review 5134770762. Runs on the reference desktop (recorded machine) with a
 * production build, representative navigation, 10s warm-up + 3 independent
 * 60s frame-time traces, and reports p95 per run plus the aggregate. Also
 * records the reference machine profile (CPU/GPU/RAM/OS/browser/viewport/DPR).
 *
 * Informational — logs results, no pass/fail assertion (budgets compared
 * manually in the final performance handoff against PERFORMANCE_BUDGET.md).
 */

const TRACES = 3
const TRACE_MS = 60_000
const WARMUP_MS = 10_000

test('reference-profile frame time: 10s warm-up + 3x60s traces, p95 per run + aggregate', async ({ page }, testInfo) => {
  test.setTimeout(TRACES * TRACE_MS + WARMUP_MS + 60_000)

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

  // Warm-up: let the scene settle past first-frame/compile cost.
  await page.waitForTimeout(WARMUP_MS)

  const runResults: number[] = []
  for (let run = 0; run < TRACES; run++) {
    const result = await page.evaluate((durationMs) => {
      return new Promise<{ p95FrameMs: number; avgFps: number; frames: number }>((resolve) => {
        const frameTimes: number[] = []
        let last = performance.now()
        const start = performance.now()
        function tick() {
          const now = performance.now()
          frameTimes.push(now - last)
          last = now
          if (now - start < durationMs) {
            requestAnimationFrame(tick)
          } else {
            const sorted = [...frameTimes].sort((a, b) => a - b)
            const p95FrameMs = sorted[Math.floor(sorted.length * 0.95)]
            const avgFps = 1000 / (frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length)
            resolve({ p95FrameMs, avgFps, frames: frameTimes.length })
          }
        }
        requestAnimationFrame(tick)
      })
    }, TRACE_MS)
    runResults.push(result.p95FrameMs)
    console.log(
      `[perf-ref-frame] run=${run + 1}/${TRACES} p95FrameMs=${result.p95FrameMs.toFixed(2)} avgFps=${result.avgFps.toFixed(1)} frames=${result.frames}`,
    )
  }

  const sorted = [...runResults].sort((a, b) => a - b)
  const aggregateP95 = sorted[Math.floor(sorted.length * 0.95)]
  console.log(
    `[perf-ref-frame] aggregate p95=${aggregateP95.toFixed(2)}ms runs=[${runResults.map((r) => r.toFixed(2)).join(',')}]ms`,
  )
  console.log(
    `[perf-ref-frame] referenceProfile viewport=${profile.viewport.w}x${profile.viewport.h} dpr=${profile.dpr} hwConcurrency=${profile.hardwareConcurrency} deviceMemory=${profile.deviceMemory} renderer=${profile.renderer}`,
  )
  console.log(
    '[perf-ref-frame] methodology=production build, representative navigation, 10s warm-up + 3 independent 60s traces; ' +
      'budget p95 <=20ms desktop (docs/architecture/PERFORMANCE_BUDGET.md); reference machine recorded in final handoff',
  )
})
