import { test, expect } from '@playwright/test'

// Traverse the R3F scene graph (exposed on the canvas by Experience3D) for
// an object by name. Lets the test assert on the 3D scene itself — e.g. that
// Zavit's idle repair console is present — without a WebGL pixel probe.
async function findSceneObject(page: import('@playwright/test').Page, name: string) {
  return page.evaluate((targetName) => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement & { __r3fScene?: { traverse?: (cb: (o: { name?: string }) => void) => void } }
    if (!canvas?.__r3fScene?.traverse) return false
    let found = false
    canvas.__r3fScene.traverse((obj) => {
      if (obj.name === targetName) found = true
    })
    return found
  }, name)
}

// Read the console panel's emissive intensity from the scene graph: > 0 while
// Zavit is working on it (idle), 0 once it stops (attentive to the visitor).
async function panelGlow(page: import('@playwright/test').Page): Promise<number> {
  return page.evaluate(() => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement & { __r3fScene?: { traverse?: (cb: (o: { name?: string; material?: { emissiveIntensity?: number } }) => void) => void } }
    if (!canvas?.__r3fScene?.traverse) return -1
    let glow = -1
    canvas.__r3fScene.traverse((obj) => {
      if (obj.name === 'zavit-panel' && typeof obj.material?.emissiveIntensity === 'number') {
        glow = obj.material.emissiveIntensity
      }
    })
    return glow
  })
}

test.describe('M4 Zavit v1', () => {
  test('Zavit greets the visitor on arrival at the Atrium and offers Guided/Free/Skip, never trapping navigation', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /enter homelab/i }).click()
    const nav = page.getByRole('navigation', { name: /homelab landmarks/i })
    await nav.getByRole('button', { name: 'Central Atrium', exact: true }).click()

    const greeting = page.getByRole('dialog', { name: 'Zavit' })
    await expect(greeting).toBeVisible({ timeout: 8000 })
    await expect(greeting.getByRole('button', { name: 'Guided Mode' })).toBeVisible()
    await expect(greeting.getByRole('button', { name: 'Free Exploration' })).toBeVisible()
    await expect(greeting.getByRole('button', { name: 'Skip' })).toBeVisible()

    // Free Exploration dismisses without seizing control - the landmark HUD keeps working.
    await greeting.getByRole('button', { name: 'Free Exploration' }).click()
    await expect(greeting).not.toBeVisible()
    await nav.getByRole('button', { name: 'Bridge', exact: true }).click()
    await expect(nav.getByRole('button', { name: 'Bridge', exact: true })).toHaveAttribute('aria-current', 'location', {
      timeout: 8000,
    })
  })

  test('does not retrigger the greeting after it has been dismissed once', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /enter homelab/i }).click()
    const nav = page.getByRole('navigation', { name: /homelab landmarks/i })
    await nav.getByRole('button', { name: 'Central Atrium', exact: true }).click()

    const greeting = page.getByRole('dialog', { name: 'Zavit' })
    await expect(greeting).toBeVisible({ timeout: 8000 })
    await greeting.getByRole('button', { name: 'Skip' }).click()
    await expect(greeting).not.toBeVisible()

    // Walk away and back - the greeting must not reappear.
    await nav.getByRole('button', { name: 'Forest Approach', exact: true }).click()
    await page.waitForTimeout(1000)
    await nav.getByRole('button', { name: 'Central Atrium', exact: true }).click()
    await page.waitForTimeout(3000)
    await expect(greeting).not.toBeVisible()
  })

  test('Guided Mode advances through the route with a visible Continue control, and can exit to Free at any time', async ({
    page,
  }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /enter homelab/i }).click()
    const nav = page.getByRole('navigation', { name: /homelab landmarks/i })
    await nav.getByRole('button', { name: 'Central Atrium', exact: true }).click()

    const greeting = page.getByRole('dialog', { name: 'Zavit' })
    await expect(greeting).toBeVisible({ timeout: 8000 })
    await greeting.getByRole('button', { name: 'Guided Mode' }).click()

    const continueButton = page.getByRole('button', { name: /^Continue to/ })
    await expect(continueButton).toBeVisible()
    await continueButton.click()
    await expect(nav.getByRole('button', { name: 'Bridge', exact: true })).toHaveAttribute('aria-current', 'location', {
      timeout: 8000,
    })

    await page.getByRole('button', { name: 'Switch to Free Exploration' }).click()
    await expect(continueButton).not.toBeVisible()
  })

  test('Guided Mode advances via the keyboard (Space/ArrowRight), not just clicking Continue', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /enter homelab/i }).click()
    const nav = page.getByRole('navigation', { name: /homelab landmarks/i })
    await nav.getByRole('button', { name: 'Central Atrium', exact: true }).click()

    const greeting = page.getByRole('dialog', { name: 'Zavit' })
    await expect(greeting).toBeVisible({ timeout: 8000 })
    await greeting.getByRole('button', { name: 'Guided Mode' }).click()

    // First advance: reaches Bridge (the stop right after Atrium).
    await page.keyboard.press('Space')
    await expect(nav.getByRole('button', { name: 'Bridge', exact: true })).toHaveAttribute('aria-current', 'location', {
      timeout: 8000,
    })

    // Second advance, via ArrowRight this time: reaches the next stop, not
    // the same one again - this is exactly the case a stale-closure bug
    // would fail (target keeps resetting to the first post-Atrium stop).
    await page.keyboard.press('ArrowRight')
    await expect(nav.getByRole('button', { name: 'Software Engineering Lab', exact: true })).toHaveAttribute(
      'aria-current',
      'location',
      { timeout: 8000 },
    )
  })

  test('reduced motion skips the noticing delay - greeting appears immediately on arrival', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await page.getByRole('button', { name: /enter homelab/i }).click()
    const nav = page.getByRole('navigation', { name: /homelab landmarks/i })
    await nav.getByRole('button', { name: 'Central Atrium', exact: true }).click()

    await expect(page.getByRole('dialog', { name: 'Zavit' })).toBeVisible({ timeout: 2000 })
  })

  test('Escape dismisses the greeting, same as Skip', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /enter homelab/i }).click()
    const nav = page.getByRole('navigation', { name: /homelab landmarks/i })
    await nav.getByRole('button', { name: 'Central Atrium', exact: true }).click()

    const greeting = page.getByRole('dialog', { name: 'Zavit' })
    await expect(greeting).toBeVisible({ timeout: 8000 })

    await page.keyboard.press('Escape')
    await expect(greeting).not.toBeVisible()
  })

  test('Tab wraps focus inside the greeting instead of escaping into background content', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /enter homelab/i }).click()
    const nav = page.getByRole('navigation', { name: /homelab landmarks/i })
    await nav.getByRole('button', { name: 'Central Atrium', exact: true }).click()

    const greeting = page.getByRole('dialog', { name: 'Zavit' })
    const guidedButton = greeting.getByRole('button', { name: 'Guided Mode' })
    await expect(guidedButton).toBeFocused({ timeout: 8000 })

    // Shift+Tab from the first focusable element must land on the last one
    // inside the dialog (Skip), never on background content.
    await page.keyboard.press('Shift+Tab')
    const focusedHandle = await page.evaluateHandle(() => document.activeElement)
    const isInsideDialog = await greeting.evaluate((dialogEl, el) => dialogEl.contains(el as Node), focusedHandle)
    expect(isInsideDialog).toBe(true)
  })

  test('Zavit performs a purposeful idle activity (repair console) that stops when greeting', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /enter homelab/i }).click()

    // Before the encounter: Zavit is idle and its repair console is present
    // in the scene, with the panel lit — the purposeful activity (US-010).
    await expect.poll(() => findSceneObject(page, 'zavit-console')).toBe(true)
    await expect.poll(() => panelGlow(page)).toBeGreaterThan(0)

    // Trigger the greeting; Zavit becomes attentive and stops working — the
    // console panel powers down (emissive intensity drops to 0).
    const nav = page.getByRole('navigation', { name: /homelab landmarks/i })
    await nav.getByRole('button', { name: 'Central Atrium', exact: true }).click()
    await expect(page.getByRole('dialog', { name: 'Zavit' })).toBeVisible({ timeout: 8000 })
    await expect.poll(() => panelGlow(page)).toBe(0)
  })
})
