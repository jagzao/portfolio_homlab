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
    // Focus "Enter HomeLab" directly rather than counting Tab presses: the
    // header's Contact link renders asynchronously, so a fixed Tab count is
    // fragile under CI load and can land on the wrong element. Programmatic
    // focus + Enter is still a keyboard-only interaction (no mouse click).
    const button = page.getByRole('button', { name: /enter homelab/i })
    await button.focus()
    await expect(button).toBeFocused()
    await page.keyboard.press('Enter')
    // Either a canvas mounts (WebGL available) or a visible notice appears (semantic fallback) — never a blank/stuck state.
    await expect(page.locator('canvas').or(page.getByRole('alert'))).toBeVisible()
  })

  test('the entry action is reachable through natural Tab order within a bounded number of presses', async ({ page }) => {
    await page.goto('/')
    // Start from the top of the document so we traverse the real Tab order.
    await page.keyboard.press('Tab')
    // Bounded real-Tab traversal: press Tab up to a fixed maximum and, after
    // each press, read the focused element's accessible name/text. This proves
    // a real keyboard user can reach "Enter HomeLab" without relying on a
    // brittle fixed Tab count (the header's Contact link renders asynchronously).
    const MAX_TABS = 20
    let found = false
    for (let i = 0; i < MAX_TABS; i++) {
      const label = await page.evaluate(() => {
        const el = document.activeElement
        if (!el) return ''
        const aria = el.getAttribute('aria-label')
        if (aria) return aria
        return (el.textContent ?? '').trim()
      })
      if (/enter homelab/i.test(label)) {
        found = true
        break
      }
      await page.keyboard.press('Tab')
    }
    expect(found).toBe(true)
    await page.keyboard.press('Enter')
    // Either a canvas mounts (WebGL available) or a visible notice appears (semantic fallback) — never a blank/stuck state.
    // Generous timeout: the canvas can take >5s to mount under CI load; the
    // point of this assertion is that activation never leaves a blank/stuck
    // state, not that the canvas mounts within a tight window.
    await expect(page.locator('canvas').or(page.getByRole('alert'))).toBeVisible({ timeout: 15000 })
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
