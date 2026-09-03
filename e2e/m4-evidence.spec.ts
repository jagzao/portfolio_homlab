import { test } from '@playwright/test'
import path from 'node:path'

const EVIDENCE_DIR = process.env.EVIDENCE_DIR ?? 'evidence'

test.describe('M4 Zavit visual evidence', () => {
  test('Zavit idle in the atrium (before greeting)', async ({ page }, testInfo) => {
    await page.goto('/')
    await page.getByRole('button', { name: /enter homelab/i }).click()
    // Stop short of the Atrium landmark itself so the encounter hasn't triggered yet.
    await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' })))
    await page.waitForTimeout(1200)
    await page.screenshot({ path: path.join(EVIDENCE_DIR, `${testInfo.project.name}-zavit-01-idle.png`) })
  })

  test('Zavit greeting dialog', async ({ page }, testInfo) => {
    await page.goto('/')
    await page.getByRole('button', { name: /enter homelab/i }).click()
    const nav = page.getByRole('navigation', { name: /homelab landmarks/i })
    await nav.getByRole('button', { name: 'Central Atrium', exact: true }).click()
    await page.getByRole('dialog', { name: 'Zavit' }).waitFor({ state: 'visible', timeout: 8000 })
    await page.screenshot({ path: path.join(EVIDENCE_DIR, `${testInfo.project.name}-zavit-02-greeting.png`) })
  })

  test('Guided Mode controls', async ({ page }, testInfo) => {
    await page.goto('/')
    await page.getByRole('button', { name: /enter homelab/i }).click()
    const nav = page.getByRole('navigation', { name: /homelab landmarks/i })
    await nav.getByRole('button', { name: 'Central Atrium', exact: true }).click()
    const greeting = page.getByRole('dialog', { name: 'Zavit' })
    await greeting.waitFor({ state: 'visible', timeout: 8000 })
    await greeting.getByRole('button', { name: 'Guided Mode' }).click()
    await page.screenshot({ path: path.join(EVIDENCE_DIR, `${testInfo.project.name}-zavit-03-guided.png`) })
  })
})
