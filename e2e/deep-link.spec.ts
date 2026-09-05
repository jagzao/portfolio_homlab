import { test, expect } from '@playwright/test'

/**
 * US-010 "direct link can open the Software Lab's semantic content without
 * replaying arrival" (P0-04). A hash fragment (#software-lab) deep-links
 * straight to the always-present semantic section — no 3D entry, no replay.
 */
test.describe('deep-link target #software-lab', () => {
  test('navigating to /#software-lab lands on the Software Engineering Lab section without entering 3D', async ({
    page,
  }) => {
    await page.goto('/#software-lab')
    await expect(page.getByRole('heading', { name: /juan.?s homelab/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Software Engineering Lab', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: /enter homelab/i })).toBeVisible()
  })

  test('the target heading is focused and scrolls into view on load', async ({ page }) => {
    await page.goto('/#software-lab')
    const heading = page.getByRole('heading', { name: 'Software Engineering Lab', exact: true })
    await expect(heading).toBeFocused()
    await expect(heading).toBeInViewport()
  })

  test('the Open Architecture Table button is reachable and opens the modal without entering 3D', async ({
    page,
  }) => {
    await page.goto('/#software-lab')
    const trigger = page.getByRole('button', { name: 'Open Architecture Table', exact: true })
    await expect(trigger).toBeVisible()
    await expect(trigger).toBeEnabled()
    await trigger.click()
    await expect(page.getByRole('dialog', { name: 'Architecture Table' })).toBeVisible()
  })

  test('the deep-link works in semantic mode when WebGL is unavailable', async ({ page }) => {
    await page.addInitScript(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      HTMLCanvasElement.prototype.getContext = (() => null) as any
    })
    await page.goto('/#software-lab')
    await expect(page.getByRole('heading', { name: 'Software Engineering Lab', exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Software Engineering Lab', exact: true })).toBeInViewport()
    const trigger = page.getByRole('button', { name: 'Open Architecture Table', exact: true })
    await expect(trigger).toBeVisible()
    await trigger.click()
    await expect(page.getByRole('dialog', { name: 'Architecture Table' })).toBeVisible()
    await expect(page.locator('canvas')).toHaveCount(0)
  })
})
