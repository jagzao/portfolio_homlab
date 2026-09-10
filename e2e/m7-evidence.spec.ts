import { test, expect } from '@playwright/test'
import path from 'node:path'

const EVIDENCE_DIR = process.env.EVIDENCE_DIR ?? 'evidence'

test('day/night toggle switches lighting/sky and stars appear only at night', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /enter homelab/i }).click()
  await page.locator('canvas').waitFor({ state: 'visible' })

  const toggle = page.getByRole('button', { name: /switch to night/i })
  await expect(toggle).toBeVisible()
  await toggle.click()
  await expect(page.getByRole('button', { name: /switch to day/i })).toBeVisible()
})

// Walking any route near the Atrium can trigger Zavit's proximity-based
// greeting mid-transit (encounter.ts), not only when explicitly navigating
// to the Atrium - whether a given walk happens to pass close enough for
// long enough is frame-timing-sensitive, so it's not reliably reproducible
// run to run. These captures are about each zone's own fidelity, not the
// greeting (which has its own dedicated captures in m4-evidence.spec.ts),
// so dismiss it if it happened to appear rather than leaving a screenshot
// timing-dependently showing or hiding an unrelated dialog.
async function dismissGreetingIfPresent(page: import('@playwright/test').Page) {
  const greeting = page.getByRole('dialog', { name: 'Zavit' })
  try {
    await greeting.waitFor({ state: 'visible', timeout: 2000 })
    await greeting.getByRole('button', { name: 'Skip' }).click()
  } catch {
    // Never triggered on this walk - nothing to dismiss.
  }
}

test.describe('M7 visual fidelity evidence', () => {
  for (const zone of ['Forest Approach', 'HomeLab Exterior', 'Central Atrium', 'Bridge', 'Software Engineering Lab']) {
    test(`day: ${zone}`, async ({ page }, testInfo) => {
      await page.goto('/')
      await page.getByRole('button', { name: /enter homelab/i }).click()
      const nav = page.getByRole('navigation', { name: /homelab landmarks/i })
      await nav.getByRole('button', { name: zone, exact: true }).click()
      await dismissGreetingIfPresent(page)
      await page.waitForTimeout(6000)
      const slug = zone.toLowerCase().replace(/\s+/g, '-')
      await page.screenshot({ path: path.join(EVIDENCE_DIR, `${testInfo.project.name}-m7-day-${slug}.png`) })
    })
  }

  test('night: Central Atrium', async ({ page }, testInfo) => {
    await page.goto('/')
    await page.getByRole('button', { name: /enter homelab/i }).click()
    await page.getByRole('button', { name: /switch to night/i }).click()
    const nav = page.getByRole('navigation', { name: /homelab landmarks/i })
    await nav.getByRole('button', { name: 'Central Atrium', exact: true }).click()
    await dismissGreetingIfPresent(page)
    await page.waitForTimeout(6000)
    await page.screenshot({ path: path.join(EVIDENCE_DIR, `${testInfo.project.name}-m7-night-central-atrium.png`) })
  })
})
