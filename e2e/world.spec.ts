import { test, expect } from '@playwright/test'

test.describe('M3 graybox journey', () => {
  test('the semantic equivalent lists every landmark with a description, independent of 3D', async ({ page }) => {
    await page.goto('/')
    const journey = page.getByRole('heading', { name: /the journey/i }).locator('..')
    await expect(journey.getByText('Forest Approach.', { exact: true })).toBeVisible()
    await expect(journey.getByText('Energy Portal.', { exact: true })).toBeVisible()
    await expect(journey.getByText('Central Atrium.', { exact: true })).toBeVisible()
    await expect(journey.getByText('Bridge.', { exact: true })).toBeVisible()
    await expect(journey.getByText('Software Engineering Lab.', { exact: true })).toBeVisible()
  })

  test('the landmark HUD is keyboard-reachable and moves the current position when activated', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /enter homelab/i }).click()
    const nav = page.getByRole('navigation', { name: /homelab landmarks/i })
    await expect(nav).toBeVisible()

    await expect(nav.getByRole('button', { name: 'Forest Approach' })).toHaveAttribute('aria-current', 'location')

    const atriumButton = nav.getByRole('button', { name: 'Central Atrium' })
    await atriumButton.focus()
    await page.keyboard.press('Enter')

    await expect(atriumButton).toHaveAttribute('aria-current', 'location', { timeout: 8000 })
  })

  test('every landmark button is reachable via real Tab presses, in order', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /enter homelab/i }).click()
    const nav = page.getByRole('navigation', { name: /homelab landmarks/i })
    await expect(nav).toBeVisible()

    const forestButton = nav.getByRole('button', { name: 'Forest Approach' })
    await forestButton.focus() // establish a known starting point, not the assertion itself
    await expect(forestButton).toBeFocused()

    // 5 real Tab presses across the other 5 buttons, in DOM/tabindex order —
    // proves the native tab sequence, not just that .focus() works.
    for (const label of ['HomeLab Exterior', 'Energy Portal', 'Central Atrium', 'Bridge', 'Software Engineering Lab']) {
      await page.keyboard.press('Tab')
      await expect(nav.getByRole('button', { name: label, exact: true })).toBeFocused()
    }
  })

  test('arrow keys move the current position (supplemental Free Exploration control)', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /enter homelab/i }).click()
    await page.locator('canvas').waitFor({ state: 'visible' })
    // The movement listener is window-level, so no click/focus target is needed.

    const nav = page.getByRole('navigation', { name: /homelab landmarks/i })
    const forestButton = nav.getByRole('button', { name: 'Forest Approach' })
    await expect(forestButton).toHaveAttribute('aria-current', 'location')

    for (let i = 0; i < 6; i++) await page.keyboard.press('ArrowUp')

    await expect(forestButton).not.toHaveAttribute('aria-current', 'location', { timeout: 5000 })
  })
})

// Ground-click raycasting is covered by unit tests (navigation.test.ts:
// clampToBounds, isPointBlocked, stepToward) and shares its setTarget path
// with the HUD button test above. Screen-space pixel targeting for a real
// click is left to manual/visual QA — projecting exact ground coordinates
// through camera FOV/aspect in a Playwright test is fragile relative to
// what it would add over the unit + HUD coverage already in place.
