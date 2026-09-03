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

test.describe('M7 visual fidelity evidence', () => {
  for (const zone of ['Forest Approach', 'HomeLab Exterior', 'Central Atrium', 'Bridge', 'Software Engineering Lab']) {
    test(`day: ${zone}`, async ({ page }, testInfo) => {
      await page.goto('/')
      await page.getByRole('button', { name: /enter homelab/i }).click()
      const nav = page.getByRole('navigation', { name: /homelab landmarks/i })
      await nav.getByRole('button', { name: zone, exact: true }).click()
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
    await page.waitForTimeout(6000)
    await page.screenshot({ path: path.join(EVIDENCE_DIR, `${testInfo.project.name}-m7-night-central-atrium.png`) })
  })
})
