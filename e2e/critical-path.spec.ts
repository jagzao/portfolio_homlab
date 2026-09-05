import { test, expect } from '@playwright/test'
import { auditNetworkRequests } from './network-isolation'

/**
 * US-010 Testing Requirements #2/#3/#5/#10: full critical path coverage
 * that the per-feature spec files (world/zavit/architecture) don't
 * individually assemble into one continuous run.
 */

test('full critical path, Guided Mode, desktop: semantic load -> 3D entry -> Atrium -> Zavit choice -> bridge -> Software Lab -> architecture interaction -> failure simulation', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /juan.?s homelab/i })).toBeVisible()

  await page.getByRole('button', { name: /enter homelab/i }).click()
  await page.locator('canvas').waitFor({ state: 'visible' })

  const nav = page.getByRole('navigation', { name: /homelab landmarks/i })
  await nav.getByRole('button', { name: 'Central Atrium', exact: true }).click()

  const greeting = page.getByRole('dialog', { name: 'Zavit' })
  await expect(greeting).toBeVisible({ timeout: 8000 })
  await greeting.getByRole('button', { name: 'Guided Mode' }).click()

  // Guided Mode walks: Bridge, then Software Engineering Lab.
  await page.getByRole('button', { name: /^Continue to Bridge/ }).click()
  await expect(nav.getByRole('button', { name: 'Bridge', exact: true })).toHaveAttribute('aria-current', 'location', {
    timeout: 8000,
  })
  await page.getByRole('button', { name: /^Continue to Software Engineering Lab/ }).click()
  await expect(nav.getByRole('button', { name: 'Software Engineering Lab', exact: true })).toHaveAttribute(
    'aria-current',
    'location',
    { timeout: 8000 },
  )

  await page.getByRole('button', { name: 'Open Architecture Table' }).first().click({ timeout: 8000 })
  const panel = page.getByRole('dialog', { name: 'Architecture Table' })
  await expect(panel).toBeVisible()
  await panel.getByRole('button', { name: 'SIMULATE FAILURE' }).click()
  await expect(panel.getByRole('status')).toContainText(/recovered/i, { timeout: 13000 })
})

test('full critical path, keyboard only: no mouse click after the initial page load', async ({ page }) => {
  await page.goto('/')

  // Tab to "Enter HomeLab" (after the header's GitHub link) and activate it.
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: /enter homelab/i })).toBeFocused()
  await page.keyboard.press('Enter')
  await page.locator('canvas').waitFor({ state: 'visible' })

  const nav = page.getByRole('navigation', { name: /homelab landmarks/i })
  await nav.getByRole('button', { name: 'Central Atrium', exact: true }).focus()
  await page.keyboard.press('Enter')

  const greeting = page.getByRole('dialog', { name: 'Zavit' })
  await expect(greeting).toBeVisible({ timeout: 8000 })
  // The dialog auto-focuses its first button (Guided Mode); Enter activates it.
  await expect(greeting.getByRole('button', { name: 'Guided Mode' })).toBeFocused()
  await page.keyboard.press('Enter')

  // Advance twice via the keyboard binding (Space), reaching the Software Lab.
  await page.keyboard.press('Space')
  await expect(nav.getByRole('button', { name: 'Bridge', exact: true })).toHaveAttribute('aria-current', 'location', {
    timeout: 8000,
  })
  await page.keyboard.press('Space')
  await expect(nav.getByRole('button', { name: 'Software Engineering Lab', exact: true })).toHaveAttribute(
    'aria-current',
    'location',
    { timeout: 8000 },
  )

  await page.getByRole('button', { name: 'Open Architecture Table' }).first().focus()
  await page.keyboard.press('Enter')
  const panel = page.getByRole('dialog', { name: 'Architecture Table' })
  await expect(panel).toBeVisible()
  await expect(panel.getByRole('button', { name: 'Close' })).toBeFocused()

  // Tab to SIMULATE FAILURE and activate it via keyboard.
  await page.getByRole('button', { name: 'SIMULATE FAILURE' }).focus()
  await page.keyboard.press('Enter')
  await expect(panel.getByRole('status')).toContainText(/recovered/i, { timeout: 13000 })
})

test('the browser never contacts Supabase or any private Second Brain endpoint during the full critical path', async ({
  page,
}) => {
  // P1-02: strengthened from a string-only `/supabase/i` denylist to a dual
  // allowlist + denylist audit. See e2e/network-isolation.ts and
  // e2e/network-boundary.spec.ts for the derived sets.
  const audit = auditNetworkRequests(page)

  await page.goto('/')
  await page.getByRole('button', { name: /enter homelab/i }).click()
  const nav = page.getByRole('navigation', { name: /homelab landmarks/i })
  await nav.getByRole('button', { name: 'Software Engineering Lab', exact: true }).click()
  await page.getByRole('button', { name: 'Open Architecture Table' }).first().click({ timeout: 8000 })
  await page.getByRole('button', { name: 'SIMULATE FAILURE' }).click()
  await page.getByRole('status').getByText(/recovered/i).waitFor({ state: 'visible', timeout: 13000 })

  expect(audit.requests, 'the critical path should have made network requests').toBeGreaterThan(0)
  expect(audit.violations).toEqual([])
})
