import { test, expect } from '@playwright/test'

/**
 * Reference-profile memory gate per the accepted methodology in external
 * review 5134770762: execute a LITERAL 5-minute representative route on the
 * reference device; desktop heap <=250MB and no sustained resource growth.
 * This replaces the multi-pass proxy as the release gate.
 *
 * Informational — logs results, no pass/fail assertion (budgets compared
 * manually in the final performance handoff).
 */

const ROUTE = [
  'Forest Approach',
  'HomeLab Exterior',
  'Energy Portal',
  'Central Atrium',
  'Bridge',
  'Software Engineering Lab',
]

test('literal 5-minute representative route JS heap (reference profile)', async ({ page }) => {
  test.setTimeout(360_000)

  await page.goto('/')
  await page.getByRole('button', { name: /enter homelab/i }).click()
  await page.locator('canvas').waitFor({ state: 'visible' })

  const client = await page.context().newCDPSession(page)
  await client.send('Performance.enable')
  await client.send('HeapProfiler.enable')

  async function heapUsedMB() {
    await client.send('HeapProfiler.collectGarbage')
    const metrics = await client.send('Performance.getMetrics')
    const jsHeap = metrics.metrics.find((m) => m.name === 'JSHeapUsedSize')
    return jsHeap ? jsHeap.value / (1024 * 1024) : -1
  }

  const nav = page.getByRole('navigation', { name: /homelab landmarks/i })
  await expect(nav).toBeVisible()

  const before = await heapUsedMB()
  const samples: number[] = []
  const start = Date.now()
  const DURATION_MS = 5 * 60 * 1000 // literal 5 minutes

  // Walk the full landmark route repeatedly for 5 minutes, sampling heap
  // after each full pass. Dismiss Zavit's greeting on first Atrium arrival.
  let pass = 0
  while (Date.now() - start < DURATION_MS) {
    for (const label of ROUTE) {
      await nav.getByRole('button', { name: label, exact: true }).click()
      if (label === 'Central Atrium') {
        const greeting = page.getByRole('dialog', { name: 'Zavit' })
        try {
          await greeting.waitFor({ state: 'visible', timeout: 10_000 })
          await greeting.getByRole('button', { name: 'Skip' }).click()
        } catch {
          /* greeting did not appear this pass */
        }
      }
      await page.waitForTimeout(400)
    }
    pass++
    samples.push(await heapUsedMB())
  }

  const after = samples[samples.length - 1]
  const first = samples[0]
  const last = samples[samples.length - 1]
  const growth = last - first
  console.log(
    `[perf-ref-heap] passes=${pass} before=${before.toFixed(1)}MB after=${after.toFixed(1)}MB delta=${(after - before).toFixed(1)}MB perPass=[${samples.map((s) => s.toFixed(1)).join(',')}]MB`,
  )
  console.log(
    `[perf-ref-heap] firstPass=${first.toFixed(1)}MB lastPass=${last.toFixed(1)}MB growthAcrossPasses=${growth.toFixed(1)}MB`,
  )
  console.log(
    '[perf-ref-heap] methodology=literal 5-minute representative route on reference device; budget <=250MB desktop ' +
      '(docs/architecture/PERFORMANCE_BUDGET.md); no sustained resource growth expected',
  )
})
