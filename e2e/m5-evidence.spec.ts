import { test, expect } from '@playwright/test'
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
    const labButton = nav.getByRole('button', { name: 'Software Engineering Lab', exact: true })
    await labButton.click()

    // Wait for the walk to actually finish so the captured background is
    // the Lab, not wherever the camera happened to be mid-transit.
    await expect(labButton).toHaveAttribute('aria-current', 'location', { timeout: 8000 })

    // The walk from the entrance passes close by Zavit, which can trigger
    // the proximity greeting mid-transit (see the same note in
    // m7-evidence.spec.ts). Experience3D hides the 3D-embedded Architecture
    // Table trigger while that greeting is open (the two are independent
    // real modals and must never be visible at once) - dismiss it if
    // present so the trigger below is actually there to click.
    const greeting = page.getByRole('dialog', { name: 'Zavit' })
    try {
      await greeting.waitFor({ state: 'visible', timeout: 2000 })
      await greeting.getByRole('button', { name: 'Skip' }).click()
    } catch {
      // Never triggered on this walk - nothing to dismiss.
    }

    // Two "Open Architecture Table" buttons exist here (semantic shell +
    // 3D overlay) - scope to the one inside the 3D experience's own
    // container (LandmarkHud's <nav> is a direct, unwrapped sibling of it
    // in Experience3D.tsx, so its parent is that container) so the capture
    // shows the panel over the 3D world, not the page scrolled to the
    // shell's own copy of the same trigger.
    const experienceContainer = nav.locator('xpath=..')
    await experienceContainer.getByRole('button', { name: 'Open Architecture Table' }).click({ timeout: 8000 })

    await page.getByRole('listitem').filter({ hasText: 'WORKER' }).click()
    await page.screenshot({ path: path.join(EVIDENCE_DIR, `${testInfo.project.name}-arch-04-in-3d.png`) })
  })
})
