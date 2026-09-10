import { test } from '@playwright/test'

test('M3 graybox: representative frame-time sample (informational, not an assertion)', async ({ page }, testInfo) => {
  await page.goto('/')
  await page.getByRole('button', { name: /enter homelab/i }).click()
  await page.locator('canvas').waitFor({ state: 'visible' })
  await page.waitForTimeout(500) // let the scene settle past first-frame cost

  const result = await page.evaluate(() => {
    return new Promise<{ avgFps: number; p95FrameMs: number; frames: number }>((resolve) => {
      const frameTimes: number[] = []
      let last = performance.now()
      function tick() {
        const now = performance.now()
        frameTimes.push(now - last)
        last = now
        if (frameTimes.length < 120) {
          requestAnimationFrame(tick)
        } else {
          const sorted = [...frameTimes].sort((a, b) => a - b)
          const p95FrameMs = sorted[Math.floor(sorted.length * 0.95)]
          const avgFps = 1000 / (frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length)
          resolve({ avgFps, p95FrameMs, frames: frameTimes.length })
        }
      }
      requestAnimationFrame(tick)
    })
  })

  console.log(`[perf-sample] ${testInfo.project.name}: avgFps=${result.avgFps.toFixed(1)} p95FrameMs=${result.p95FrameMs.toFixed(2)} frames=${result.frames}`)
})
