import { test } from '@playwright/test'
import { recordEvidence } from '../scripts/perf-evidence.mjs'

/**
 * Reference-profile mobile-4G LCP/CLS gate per the accepted methodology in
 * external review 5134770762 / re-audit 5136245139:
 *   - mobile 4G profile: 4 Mbps down / 150ms RTT (CDP network throttling)
 *   - 10 clean-cache runs (fresh context each run, no cache reuse)
 *   - record all 10 LCP and CLS values
 *   - compute p75 for each
 *   - LCP <= 2.5s, CLS <= 0.10
 *
 * Informational — logs results, no pass/fail assertion (budgets compared
 * manually in the final performance handoff against PERFORMANCE_BUDGET.md).
 */

const RUNS = 10

test('mobile-4G LCP/CLS: 10 clean-cache runs at 4Mbps/150ms RTT, p75', async ({ page }) => {
  test.setTimeout(RUNS * 30_000)

  const lcpValues: number[] = []
  const clsValues: number[] = []

  for (let run = 0; run < RUNS; run++) {
    // Fresh context per run = clean cache (no shared HTTP cache across runs).
    const context = await page.context().browser()!.newContext({
      viewport: { width: 412, height: 915 },
      deviceScaleFactor: 2.625,
      isMobile: true,
      hasTouch: true,
    })
    const p = await context.newPage()

    // Apply mobile-4G network throttling via CDP: 4 Mbps down, 150ms RTT.
    const cdp = await context.newCDPSession(p)
    await cdp.send('Network.enable')
    await cdp.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 150,
      downloadThroughput: 4 * 1024 * 1024 / 8, // 4 Mbps = 0.5 MB/s
      uploadThroughput: 1 * 1024 * 1024 / 8,
      connectionType: 'cellular3g',
    })

    // Arm LCP/CLS observers on the page BEFORE navigation. addInitScript runs
    // before every navigation, so the observers survive the goto (a plain
    // evaluate would be wiped by the page reload).
    await p.addInitScript(() => {
      const w = window as unknown as { __lcp: number | null; __cls: number }
      w.__lcp = null
      w.__cls = 0
      try {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const last = entries[entries.length - 1] as PerformanceEntry & { startTime: number }
          if (last) w.__lcp = last.startTime
        }).observe({ type: 'largest-contentful-paint', buffered: true })
      } catch {
        /* LCP not supported */
      }
      try {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as Array<PerformanceEntry & { value: number; hadRecentInput: boolean }>) {
            if (!entry.hadRecentInput) w.__cls += entry.value
          }
        }).observe({ type: 'layout-shift', buffered: true })
      } catch {
        /* CLS not supported */
      }
    })

    await p.goto('http://localhost:4173/', { waitUntil: 'load' })
    await p.waitForTimeout(500) // let LCP/CLS settle

    const result = await p.evaluate(() => {
      const w = window as unknown as { __lcp: number | null; __cls: number }
      return { lcp: w.__lcp, cls: w.__cls }
    })

    lcpValues.push(result.lcp ?? -1)
    clsValues.push(result.cls)
    console.log(`[perf-ref-vitals] run=${run + 1}/${RUNS} LCP=${(result.lcp ?? -1).toFixed(0)}ms CLS=${result.cls.toFixed(3)}`)

    await context.close()
  }

  const lcpSorted = [...lcpValues].sort((a, b) => a - b)
  const clsSorted = [...clsValues].sort((a, b) => a - b)
  const lcpP75 = lcpSorted[Math.floor(lcpSorted.length * 0.75)]
  const clsP75 = clsSorted[Math.floor(clsSorted.length * 0.75)]

  console.log(`[perf-ref-vitals] LCP all=[${lcpValues.map((v) => v.toFixed(0)).join(',')}]ms p75=${lcpP75.toFixed(0)}ms`)
  console.log(`[perf-ref-vitals] CLS all=[${clsValues.map((v) => v.toFixed(3)).join(',')}] p75=${clsP75.toFixed(3)}`)
  console.log(
    '[perf-ref-vitals] methodology=mobile 4G (4Mbps/150ms RTT via CDP), 10 clean-cache runs (fresh context each), ' +
      'all values recorded, p75 computed; budget LCP <=2.5s / CLS <=0.10 (docs/architecture/PERFORMANCE_BUDGET.md)',
  )

  recordEvidence({
    vitals: { lcpAll: lcpValues, clsAll: clsValues, lcpP75, clsP75 },
  })
})
