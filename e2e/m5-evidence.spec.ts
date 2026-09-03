import { test } from '@playwright/test'
import path from 'node:path'

const EVIDENCE_DIR = process.env.EVIDENCE_DIR ?? 'evidence'

test.describe('M5 Architecture Table visual evidence', () => {
  test('panel, baseline', async ({ page }, testInfo) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Open Architecture Table' }).click()
    await page.getByRole('listitem').filter({ hasText: 'WORKER' }).click()
    await page.screenshot({ path: path.join(EVIDENCE_DIR, `${testInfo.project.name}-arch-01-baseline.png`) })
  })

  test('panel, mid-failure', async ({ page }, testInfo) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Open Architecture Table' }).click()
    await page.getByRole('button', { name: 'SIMULATE FAILURE' }).click()
    await page.waitForTimeout(6500) // land inside the circuit-breaker-open frame
    await page.screenshot({ path: path.join(EVIDENCE_DIR, `${testInfo.project.name}-arch-02-mid-failure.png`) })
  })

  test('panel, recovered', async ({ page }, testInfo) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Open Architecture Table' }).click()
    await page.getByRole('button', { name: 'SIMULATE FAILURE' }).click()
    await page.getByRole('status').getByText(/recovered/i).waitFor({ state: 'visible', timeout: 13000 })
    await page.screenshot({ path: path.join(EVIDENCE_DIR, `${testInfo.project.name}-arch-03-recovered.png`) })
  })

  test('panel over the 3D world, at the Software Engineering Lab landmark', async ({ page }, testInfo) => {
    await page.goto('/')
    await page.getByRole('button', { name: /enter homelab/i }).click()
    const nav = page.getByRole('navigation', { name: /homelab landmarks/i })
    await nav.getByRole('button', { name: 'Software Engineering Lab', exact: true }).click()
    await page.getByRole('button', { name: 'Open Architecture Table' }).first().click({ timeout: 8000 })
    await page.getByRole('listitem').filter({ hasText: 'WORKER' }).click()
    await page.screenshot({ path: path.join(EVIDENCE_DIR, `${testInfo.project.name}-arch-04-in-3d.png`) })
  })
})
