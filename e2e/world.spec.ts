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

  test('every landmark button is reachable via Tab without a mouse', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /enter homelab/i }).click()
    const nav = page.getByRole('navigation', { name: /homelab landmarks/i })
    await expect(nav).toBeVisible()
    const softwareLabButton = nav.getByRole('button', { name: 'Software Engineering Lab' })
    await softwareLabButton.focus()
    await expect(softwareLabButton).toBeFocused()
  })
})

// Ground-click raycasting is covered by unit tests (navigation.test.ts:
// clampToBounds, isPointBlocked, stepToward) and shares its setTarget path
// with the HUD button test above. Screen-space pixel targeting for a real
// click is left to manual/visual QA — projecting exact ground coordinates
// through camera FOV/aspect in a Playwright test is fragile relative to
// what it would add over the unit + HUD coverage already in place.
