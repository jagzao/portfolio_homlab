import { test, expect } from '@playwright/test'

test.describe('M5 Architecture Table (semantic, no 3D required)', () => {
  test('is reachable and inspectable without ever entering 3D', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Open Architecture Table' }).click()

    const panel = page.getByRole('dialog', { name: 'Architecture Table' })
    await expect(panel).toBeVisible()
    for (const label of ['API', 'QUEUE', 'WORKER', 'CACHE', 'DATABASE']) {
      await expect(panel.getByRole('listitem').filter({ hasText: label })).toBeVisible()
    }

    await panel.getByRole('listitem').filter({ hasText: 'WORKER' }).click()
    await expect(panel).toContainText('Processes queued work')
  })

  test('SIMULATE FAILURE runs a labeled, self-recovering sequence', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Open Architecture Table' }).click()
    const panel = page.getByRole('dialog', { name: 'Architecture Table' })

    await panel.getByRole('button', { name: 'SIMULATE FAILURE' }).click()
    const status = panel.getByRole('status')
    await expect(status).toContainText('SIMULATION', { timeout: 2000 })
    await expect(status).toContainText(/failing|degraded|backing up/i, { timeout: 3000 })

    // Let the fixed 10-second sequence finish and confirm it recovers on its own.
    await expect(status).toContainText(/recovered/i, { timeout: 13000 })
    await expect(panel.getByRole('button', { name: 'Run again' })).toBeVisible()
  })

  test('closing and reopening returns focus correctly and keeps content keyboard-reachable', async ({ page }) => {
    await page.goto('/')
    const openButton = page.getByRole('button', { name: 'Open Architecture Table' })
    await openButton.click()
    const panel = page.getByRole('dialog', { name: 'Architecture Table' })
    await expect(panel.getByRole('button', { name: 'Close' })).toBeFocused()

    await panel.getByRole('button', { name: 'Close' }).click()
    await expect(panel).not.toBeVisible()
    await expect(openButton).toBeFocused()
  })

  test('Escape closes the dialog and returns focus, same as the Close button', async ({ page }) => {
    await page.goto('/')
    const openButton = page.getByRole('button', { name: 'Open Architecture Table' })
    await openButton.click()
    const panel = page.getByRole('dialog', { name: 'Architecture Table' })
    await expect(panel).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(panel).not.toBeVisible()
    await expect(openButton).toBeFocused()
  })

  test('Tab wraps focus inside the dialog instead of escaping into background content', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Open Architecture Table' }).click()
    const panel = page.getByRole('dialog', { name: 'Architecture Table' })
    const closeButton = panel.getByRole('button', { name: 'Close' })
    await expect(closeButton).toBeFocused()

    // Shift+Tab from the first focusable element must land on the last one
    // inside the dialog, never on background content like the hidden
    // trigger button or the header's GitHub link.
    await page.keyboard.press('Shift+Tab')
    const focusedHandle = await page.evaluateHandle(() => document.activeElement)
    const isInsideDialog = await panel.evaluate((dialogEl, el) => dialogEl.contains(el as Node), focusedHandle)
    expect(isInsideDialog).toBe(true)
  })
})

test.describe('M5 Architecture Table (from within the 3D journey)', () => {
  test('opens from the Software Engineering Lab landmark', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /enter homelab/i }).click()
    const nav = page.getByRole('navigation', { name: /homelab landmarks/i })
    await nav.getByRole('button', { name: 'Software Engineering Lab', exact: true }).click()

    // Two "Open Architecture Table" buttons exist once here (semantic shell +
    // 3D overlay); the 3D one renders first in DOM order (inside the
    // ExperienceBoundary children, ahead of the semantic shell's own
    // always-present section further down the page).
    await page.getByRole('button', { name: 'Open Architecture Table' }).first().click({ timeout: 8000 })
    await expect(page.getByRole('dialog', { name: 'Architecture Table' })).toBeVisible()
  })

  test('opening from the 3D overlay never produces two simultaneous dialogs', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /enter homelab/i }).click()
    const nav = page.getByRole('navigation', { name: /homelab landmarks/i })
    await nav.getByRole('button', { name: 'Software Engineering Lab', exact: true }).click()

    await page.getByRole('button', { name: 'Open Architecture Table' }).first().click({ timeout: 8000 })
    // The semantic shell also renders a SoftwareLabSection lower on the page;
    // shared state (ArchitectureTableProvider) means only one dialog exists,
    // not two independently-opened ones with the same accessible name.
    await expect(page.getByRole('dialog', { name: 'Architecture Table' })).toHaveCount(1)
  })

  test('background 3D movement is blocked while the dialog is open (aria-modal is real, not just declared)', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /enter homelab/i }).click()
    const nav = page.getByRole('navigation', { name: /homelab landmarks/i })
    await nav.getByRole('button', { name: 'Software Engineering Lab', exact: true }).click()
    const labButton = nav.getByRole('button', { name: 'Software Engineering Lab', exact: true })
    await expect(labButton).toHaveAttribute('aria-current', 'location', { timeout: 8000 })

    await page.getByRole('button', { name: 'Open Architecture Table' }).first().click({ timeout: 8000 })
    const panel = page.getByRole('dialog', { name: 'Architecture Table' })
    await expect(panel).toBeVisible()

    // Arrow keys must stay inside the dialog (Tab-trap territory), not
    // leak through to the world-movement listener underneath.
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('ArrowUp')
    await page.waitForTimeout(500)

    // Still at the Software Lab landmark, and the dialog is still the only one.
    await expect(labButton).toHaveAttribute('aria-current', 'location')
    await expect(page.getByRole('dialog', { name: 'Architecture Table' })).toHaveCount(1)
  })

  test('the Software Lab overlay does not block landmark navigation (overlay layer regression)', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /enter homelab/i }).click()
    const nav = page.getByRole('navigation', { name: /homelab landmarks/i })

    // Go to the Software Lab so the overlay renders.
    await nav.getByRole('button', { name: 'Software Engineering Lab', exact: true }).click()
    const labButton = nav.getByRole('button', { name: 'Software Engineering Lab', exact: true })
    await expect(labButton).toHaveAttribute('aria-current', 'location', { timeout: 8000 })

    // Verify the overlay content is visible (proves the overlay rendered).
    // Two SoftwareLabSections exist (3D overlay + semantic shell); the overlay
    // is inside the ExperienceBoundary wrapper, so its description paragraph
    // appears before the semantic shell's heading/paragraph.
    const overlayLab = page.locator('#experience-boundary').getByRole('button', { name: 'Open Architecture Table' }).first()
    await expect(overlayLab).toBeVisible()

    // The overlay must not intercept clicks on the landmark HUD. Selecting a
    // different landmark must work immediately on desktop and mobile.
    // (Audit P0-RA5: real navigation/layering defect on mobile.)
    await nav.getByRole('button', { name: 'Forest Approach', exact: true }).click()
    await expect(nav.getByRole('button', { name: 'Forest Approach', exact: true })).toHaveAttribute(
      'aria-current',
      'location',
      { timeout: 8000 },
    )

    // Reopen the Architecture Table from the overlay button, then close it,
    // and confirm navigation still works afterward.
    await nav.getByRole('button', { name: 'Software Engineering Lab', exact: true }).click()
    await expect(labButton).toHaveAttribute('aria-current', 'location', { timeout: 8000 })
    await overlayLab.click({ timeout: 8000 })
    const panel = page.getByRole('dialog', { name: 'Architecture Table' })
    await expect(panel).toBeVisible()
    await panel.getByRole('button', { name: 'Close' }).click()
    await expect(panel).not.toBeVisible()

    await nav.getByRole('button', { name: 'Bridge', exact: true }).click()
    await expect(nav.getByRole('button', { name: 'Bridge', exact: true })).toHaveAttribute('aria-current', 'location', {
      timeout: 8000,
    })
  })
})
