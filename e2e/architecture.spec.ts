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
})
