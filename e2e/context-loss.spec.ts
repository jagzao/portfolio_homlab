import { test, expect } from '@playwright/test'

// The canvas element becomes visible as soon as R3F mounts it, but the
// `webglcontextlost` listener is only attached once `onCreated` fires (after
// the GL context is created). Retry the dispatch until the notice appears so
// the test doesn't race the listener attachment.
async function loseContext(page: import('@playwright/test').Page) {
  const canvas = page.locator('canvas')
  await expect(canvas).toBeVisible()
  await expect
    .poll(async () => {
      await canvas.evaluate((el) => {
        el.dispatchEvent(new Event('webglcontextlost', { cancelable: true }))
      })
      return page.getByRole('alert').isVisible()
    })
    .toBe(true)
}

test.describe('WebGL context-loss fallback (ADR-002)', () => {
  test('falls back to a visible semantic notice on context loss, no reload loop', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /enter homelab/i }).click()
    await loseContext(page)

    const notice = page.getByRole('alert')
    await expect(notice).toBeVisible()
    await expect(notice).toContainText(/3d unavailable/i)
    await expect(page.locator('canvas')).toHaveCount(0)
  })

  test('semantic shell content remains reachable after context loss', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /enter homelab/i }).click()
    await loseContext(page)

    await expect(page.getByRole('alert')).toBeVisible()
    await expect(page.getByRole('heading', { name: /juan.?s homelab/i })).toBeVisible()
  })

  test('does not reload the page on context loss', async ({ page }) => {
    let reloads = 0
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) reloads += 1
    })

    await page.goto('/')
    await page.getByRole('button', { name: /enter homelab/i }).click()
    await loseContext(page)

    await expect(page.getByRole('alert')).toBeVisible()
    // Initial goto is one navigation; the context-lost fallback must not add another.
    expect(reloads).toBe(1)
  })
})
