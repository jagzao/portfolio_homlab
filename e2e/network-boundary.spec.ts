import { test, expect } from '@playwright/test'
import { auditNetworkRequests } from './network-isolation'

/**
 * P1-02: strengthen the public/private network boundary proof.
 *
 * Runs the full critical path (semantic load -> 3D entry -> Software Lab ->
 * architecture interaction -> failure simulation) while capturing every
 * browser request. Instead of a string-only `/supabase/i` denylist, the test
 * asserts BOTH:
 *   1. every request host is in the explicit ALLOWLIST (the app's own origin),
 *      so a renamed proxy/private endpoint cannot bypass a string-only test;
 *   2. no request URL contains any explicit DENYLIST identifier (the Supabase
 *      project id, `supabase`, `rest/v1`, `graphql`, `rpc`).
 *
 * See e2e/network-isolation.ts for the derived allowlist/denylist and
 * docs/architecture/PORTFOLIO_KNOWLEDGE_ARCHITECTURE.md for the trust boundary.
 */
test('network boundary: every request is to the app origin and never touches any private Second Brain endpoint', async ({
  page,
}) => {
  const audit = auditNetworkRequests(page)

  await page.goto('/')
  await expect(page.getByRole('heading', { name: /juan.?s homelab/i })).toBeVisible()

  await page.getByRole('button', { name: /enter homelab/i }).click()
  await page.locator('canvas').waitFor({ state: 'visible' })

  const nav = page.getByRole('navigation', { name: /homelab landmarks/i })
  await nav.getByRole('button', { name: 'Software Engineering Lab', exact: true }).click()

  await page.getByRole('button', { name: 'Open Architecture Table' }).first().click({ timeout: 8000 })
  const panel = page.getByRole('dialog', { name: 'Architecture Table' })
  await expect(panel).toBeVisible()
  await panel.getByRole('button', { name: 'SIMULATE FAILURE' }).click()
  await expect(panel.getByRole('status')).toContainText(/recovered/i, { timeout: 13000 })

  // The critical path must have actually exercised real HTTP (the page + assets).
  expect(audit.requests, 'the critical path should have made network requests').toBeGreaterThan(0)
  expect(audit.violations).toEqual([])
})
