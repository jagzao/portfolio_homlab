import { test, expect } from '@playwright/test'

// Read the camera's yaw (rotation) directly from the R3F camera, exposed on
// the canvas by Experience3D. The default camera starts with rotation ~0.
async function cameraRotationY(page: import('@playwright/test').Page): Promise<number> {
  return page.evaluate(() => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement & {
      __r3fCamera?: { rotation?: { y?: number } }
    }
    return canvas?.__r3fCamera?.rotation?.y ?? NaN
  })
}

test.describe('P0-02 movement/input model', () => {
  test('Escape opens semantic navigation (focuses the JourneyList section)', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /enter homelab/i }).click()
    await page.locator('canvas').waitFor({ state: 'visible' })

    await page.keyboard.press('Escape')
    await expect(page.locator('#journey-list')).toBeFocused()
  })

  test('Escape does not steal focus while the Zavit greeting modal is open', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /enter homelab/i }).click()
    const nav = page.getByRole('navigation', { name: /homelab landmarks/i })
    await nav.getByRole('button', { name: 'Central Atrium', exact: true }).click()

    const greeting = page.getByRole('dialog', { name: 'Zavit' })
    await expect(greeting).toBeVisible({ timeout: 8000 })

    await page.keyboard.press('Escape')
    await expect(greeting).not.toBeVisible()
    // The greeting's own Escape dismisses it and returns focus where it came from.
    await expect(page.locator('#journey-list')).not.toBeFocused()
  })

  test('Skip stop jumps past the next stop without dwelling there', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /enter homelab/i }).click()
    const nav = page.getByRole('navigation', { name: /homelab landmarks/i })
    await nav.getByRole('button', { name: 'Central Atrium', exact: true }).click()

    const greeting = page.getByRole('dialog', { name: 'Zavit' })
    await expect(greeting).toBeVisible({ timeout: 8000 })
    await greeting.getByRole('button', { name: 'Guided Mode' }).click()

    // After Atrium, the next stop is Bridge (index 4), the one after is
    // Software Engineering Lab (index 5). Skipping should land on the Lab.
    const skipButton = page.getByRole('button', { name: 'Skip stop' })
    await expect(skipButton).toBeVisible()
    await skipButton.click()

    await expect(nav.getByRole('button', { name: 'Software Engineering Lab', exact: true })).toHaveAttribute(
      'aria-current',
      'location',
      { timeout: 8000 },
    )
  })
})

test.describe('P0-02 drag-to-look (Free Exploration, touch)', () => {
  test.use({ hasTouch: true })

  // Force the coarse-pointer media query so drag-to-look activates regardless
  // of the runner's project (desktop-chromium has a fine pointer by default).
  const forceCoarsePointer = async (page: import('@playwright/test').Page) => {
    await page.addInitScript(() => {
      window.matchMedia = (query: string) =>
        ({
          matches: query.includes('pointer') && query.includes('coarse'),
          media: query,
          onchange: null,
          addEventListener: () => {},
          removeEventListener: () => {},
          addListener: () => {},
          removeListener: () => {},
          dispatchEvent: () => false,
        }) as MediaQueryList
    })
  }

  test('dragging horizontally on the canvas rotates the camera yaw in Free Exploration', async ({ page }) => {
    await forceCoarsePointer(page)
    await page.goto('/')
    await page.getByRole('button', { name: /enter homelab/i }).click()
    const nav = page.getByRole('navigation', { name: /homelab landmarks/i })
    await nav.getByRole('button', { name: 'Central Atrium', exact: true }).click()

    const greeting = page.getByRole('dialog', { name: 'Zavit' })
    await expect(greeting).toBeVisible({ timeout: 8000 })
    await greeting.getByRole('button', { name: 'Free Exploration' }).click()

    const canvas = page.locator('canvas')
    await canvas.waitFor({ state: 'visible' })
    const box = (await canvas.boundingBox())!

    // A clear horizontal drag far above the touch threshold rotates the look.
    await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.move(box.x + box.width * 0.25, box.y + box.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width * 0.75, box.y + box.height / 2, { steps: 10 })
    await page.mouse.up()

    await expect.poll(() => cameraRotationY(page)).not.toBeCloseTo(0, 0)
  })

  test('drag-to-look is NOT active in Guided Mode (yaw stays fixed forward)', async ({ page }) => {
    await forceCoarsePointer(page)
    await page.goto('/')
    await page.getByRole('button', { name: /enter homelab/i }).click()
    const nav = page.getByRole('navigation', { name: /homelab landmarks/i })
    await nav.getByRole('button', { name: 'Central Atrium', exact: true }).click()

    const greeting = page.getByRole('dialog', { name: 'Zavit' })
    await expect(greeting).toBeVisible({ timeout: 8000 })
    await greeting.getByRole('button', { name: 'Guided Mode' }).click()

    const canvas = page.locator('canvas')
    await canvas.waitFor({ state: 'visible' })
    const box = (await canvas.boundingBox())!

    await page.mouse.move(box.x + box.width * 0.25, box.y + box.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width * 0.75, box.y + box.height / 2, { steps: 10 })
    await page.mouse.up()

    await expect.poll(() => cameraRotationY(page)).toBeCloseTo(0, 1)
  })
})
