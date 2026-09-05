import { test } from '@playwright/test'

/**
 * M8 measurements not yet captured elsewhere: JS heap after repeated 3D
 * enter/exit cycles (leak check) and Web Vitals on initial semantic load.
 * Informational — logs results, no pass/fail assertion (real thresholds
 * live in docs/architecture/PERFORMANCE_BUDGET.md, compared manually in
 * the M8 handoff).
 */

test('JS heap after 5 enter/exit cycles of the 3D experience (leak check)', async ({ page }) => {
  await page.goto('/')

  const client = await page.context().newCDPSession(page)
  await client.send('Performance.enable')
  await client.send('HeapProfiler.enable')

  async function heapUsedMB() {
    await client.send('HeapProfiler.collectGarbage')
    const metrics = await client.send('Performance.getMetrics')
    const jsHeap = metrics.metrics.find((m) => m.name === 'JSHeapUsedSize')
    return jsHeap ? jsHeap.value / (1024 * 1024) : -1
  }

  const before = await heapUsedMB()

  for (let i = 0; i < 5; i++) {
    await page.getByRole('button', { name: /enter homelab/i }).click()
    await page.locator('canvas').waitFor({ state: 'visible' })
    // Reload to fully exit the 3D experience and force a clean remount next cycle.
    await page.reload()
  }

  const after = await heapUsedMB()
  console.log(`[m8-heap] before=${before.toFixed(1)}MB after 5 enter/exit cycles=${after.toFixed(1)}MB delta=${(after - before).toFixed(1)}MB`)
})

test('Web Vitals on initial semantic load', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('load')
  await page.waitForTimeout(500) // let LCP/CLS settle

  const vitals = await page.evaluate(() => {
    return new Promise<{ lcp: number | null; cls: number }>((resolve) => {
      let lcp: number | null = null
      let cls = 0
      try {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const last = entries[entries.length - 1] as PerformanceEntry & { startTime: number }
          if (last) lcp = last.startTime
        }).observe({ type: 'largest-contentful-paint', buffered: true })
      } catch {
        /* LCP not supported in this browser context */
      }
      try {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as Array<PerformanceEntry & { value: number; hadRecentInput: boolean }>) {
            if (!entry.hadRecentInput) cls += entry.value
          }
        }).observe({ type: 'layout-shift', buffered: true })
      } catch {
        /* CLS not supported in this browser context */
      }
      setTimeout(() => resolve({ lcp, cls }), 300)
    })
  })

  console.log(`[m8-vitals] LCP=${vitals.lcp?.toFixed(0) ?? 'n/a'}ms CLS=${vitals.cls.toFixed(3)}`)
})

test('long tasks and INP proxy during entry (semantic load -> 3D enter -> first interaction)', async ({ page }) => {
  await page.goto('/')

  // Arm the observers before the entry click so nothing during entry is missed.
  await page.evaluate(() => {
    ;(window as unknown as { __longTasks: PerformanceEntry[] }).__longTasks = []
    try {
      new PerformanceObserver((list) => {
        ;(window as unknown as { __longTasks: PerformanceEntry[] }).__longTasks.push(...list.getEntries())
      }).observe({ type: 'longtask', buffered: true })
    } catch {
      /* Long Tasks API not supported in this browser context */
    }
  })

  await page.getByRole('button', { name: /enter homelab/i }).click()
  await page.locator('canvas').waitFor({ state: 'visible' })
  await page.waitForTimeout(500) // let the scene settle after first render

  // INP proper needs a real user gesture measured via the Event Timing API's
  // reporting pipeline, which is awkward to script deterministically headless.
  // As a documented proxy: time a real click round-trip (day/night toggle)
  // through to its visible DOM effect - not a substitute for a field INP
  // metric, but real signal on single-interaction responsiveness.
  const toggle = page.getByRole('button', { name: /switch to night/i })
  const interactionStart = Date.now()
  await toggle.click()
  await page.getByRole('button', { name: /switch to day/i }).waitFor({ state: 'visible' })
  const interactionMs = Date.now() - interactionStart

  const longTasks = await page.evaluate(
    () => (window as unknown as { __longTasks: PerformanceEntry[] }).__longTasks.map((e) => Math.round(e.duration)),
  )
  const over50 = longTasks.filter((d) => d > 50).length
  const over200 = longTasks.filter((d) => d > 200).length

  console.log(
    `[m8-longtask] duringEntry: count=${longTasks.length} over50ms=${over50} over200ms=${over200} durations=[${longTasks.join(',')}]ms`,
  )
  console.log(`[m8-inp-proxy] toggle-click-to-visible-effect=${interactionMs}ms (proxy only, not a field INP measurement)`)
})
