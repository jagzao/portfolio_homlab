import { test } from '@playwright/test'
import path from 'node:path'

const EVIDENCE_DIR = process.env.EVIDENCE_DIR ?? 'evidence'

async function goToLandmark(page: import('@playwright/test').Page, label: string) {
  await page.getByRole('button', { name: /enter homelab/i }).click()
  const nav = page.getByRole('navigation', { name: /homelab landmarks/i })
  await nav.getByRole('button', { name: label, exact: true }).click()
  await page.waitForTimeout(6000) // full traverse worst case ~5s at MOVE_SPEED
}

test.describe('M3 graybox zone evidence', () => {
  const zones = ['Forest Approach', 'HomeLab Exterior', 'Energy Portal', 'Central Atrium', 'Bridge', 'Software Engineering Lab']

  for (const zone of zones) {
    test(`zone: ${zone}`, async ({ page }, testInfo) => {
      await page.goto('/')
      await goToLandmark(page, zone)
      const slug = zone.toLowerCase().replace(/\s+/g, '-')
      await page.screenshot({ path: path.join(EVIDENCE_DIR, `${testInfo.project.name}-zone-${slug}.png`) })
    })
  }
})
