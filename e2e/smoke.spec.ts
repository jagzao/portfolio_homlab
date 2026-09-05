import { test, expect } from '@playwright/test'

test.describe('semantic shell', () => {
  test('loads and identifies Juan and HomeLab without requiring 3D', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /juan.?s homelab/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /enter homelab/i })).toBeVisible()
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(String(error)))
    expect(errors).toEqual([])
  })

  test('the entry action is reachable and activatable by keyboard alone', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Tab') // skip the Contact link
    await page.keyboard.press('Tab')
    const button = page.getByRole('button', { name: /enter homelab/i })
    await expect(button).toBeFocused()
    await page.keyboard.press('Enter')
    // Either a canvas mounts (WebGL available) or a visible notice appears (semantic fallback) — never a blank/stuck state.
    await expect(page.locator('canvas').or(page.getByRole('alert'))).toBeVisible()
  })
})

test.describe('degraded-mode fallback (ADR-002)', () => {
  test('falls back to a visible semantic notice when WebGL is unavailable', async ({ page }) => {
    await page.addInitScript(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      HTMLCanvasElement.prototype.getContext = (() => null) as any
    })
    await page.goto('/')
    await page.getByRole('button', { name: /enter homelab/i }).click()
    const notice = page.getByRole('alert')
    await expect(notice).toBeVisible()
    await expect(notice).toContainText(/3d unavailable/i)
    await expect(page.locator('canvas')).toHaveCount(0)
  })

  test('offers a "Try 3D" opt-in when data saver is on, and can recover into the canvas', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window.navigator, 'connection', {
        value: { saveData: true },
        configurable: true,
      })
    })
    await page.goto('/')
    await page.getByRole('button', { name: /enter homelab/i }).click()
    const notice = page.getByRole('alert')
    await expect(notice).toBeVisible()
    const tryButton = notice.getByRole('button', { name: /try 3d/i })
    await expect(tryButton).toBeVisible()
    await tryButton.click()
    await expect(page.locator('canvas')).toBeVisible()
  })
})

test.describe('reduced motion (ADR-002)', () => {
  test('accepts the entry action without console errors when reduced motion is on', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(String(error)))
    await page.goto('/')
    await page.getByRole('button', { name: /enter homelab/i }).click()
    await expect(page.locator('canvas').or(page.getByRole('alert'))).toBeVisible()
    expect(errors).toEqual([])
  })
})
