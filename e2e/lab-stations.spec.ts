import { test, expect } from '@playwright/test'

test.describe('M5 Software Engineering Lab stations (semantic, no 3D required)', () => {
  test('Engineering Decisions are inspectable: expand and collapse each generic trade-off', async ({ page }) => {
    await page.goto('/')
    const section = page.getByRole('region', { name: 'Software Engineering Lab' }).last()
    const openDecision = section.locator('button[aria-expanded="true"]').first()
    await expect(openDecision).toHaveAttribute('aria-controls')
    const firstDetailId = await openDecision.getAttribute('aria-controls')
    await expect(section.locator(`#${firstDetailId}`)).toBeVisible()
    await expect(section.locator(`#${firstDetailId}`)).toContainText('When to choose which')

    // Collapse the open one.
    await openDecision.click()
    await expect(section.locator(`#${firstDetailId}`)).not.toBeVisible()

    // Expand a collapsed one and confirm its reasoning + guidance render.
    const collapsed = section.locator('button[aria-expanded="false"]').first()
    await collapsed.click()
    const newlyExpanded = section.locator('button[aria-expanded="true"]').first()
    const detailId = await newlyExpanded.getAttribute('aria-controls')
    const detail = section.locator(`#${detailId}`)
    await expect(detail).toBeVisible()
    await expect(detail).toContainText('Trade-off')
    await expect(detail).toContainText('When to choose which')
  })

  test('Engineering Decisions are clearly labeled generic, not professional claims', async ({ page }) => {
    await page.goto('/')
    const section = page.getByRole('region', { name: 'Software Engineering Lab' }).last()
    await expect(section).toContainText('Generic engineering trade-offs')
  })

  test('Technology Wall renders the neutral empty state with the three buckets and no fabricated technologies', async ({ page }) => {
    await page.goto('/')
    const section = page.getByRole('region', { name: 'Software Engineering Lab' }).last()
    const wall = section.getByRole('heading', { name: 'Technology Wall v1' }).locator('..')
    await expect(wall).toBeVisible()

    for (const bucket of ['CORE', 'PRODUCTION EXPERIENCE', 'ACTIVE EXPLORATION']) {
      await expect(wall).toContainText(bucket)
    }
    await expect(wall).toContainText('Pending verified content')
  })

  test('Current Workbench renders the neutral empty state, never invented experiments', async ({ page }) => {
    await page.goto('/')
    const section = page.getByRole('region', { name: 'Software Engineering Lab' }).last()
    const workbench = section.getByRole('heading', { name: 'Current Workbench v1' }).locator('..')
    await expect(workbench).toContainText(
      'Current workbench experiments will appear here once verified public content is published.',
    )
  })

  test('honest recruiter-target intro is present without invented professional claims', async ({ page }) => {
    await page.goto('/')
    const section = page.getByRole('region', { name: 'Software Engineering Lab' }).last()
    await expect(section).toContainText('verified public content is published')
  })

  test('all stations are keyboard-reachable (Tab cycles through the lab focusables)', async ({ page }) => {
    await page.goto('/')
    const section = page.getByRole('region', { name: 'Software Engineering Lab' }).last()
    await expect(section).toContainText('Engineering Decisions v1')
    await expect(section).toContainText('Technology Wall v1')
    await expect(section).toContainText('Current Workbench v1')

    // Every focusable in the lab is reachable: focus each one directly and
    // confirm it receives focus (native Tab order is verified by the
    // world.spec.ts landmark test; here we confirm the lab's own controls
    // are all focusable, not just the first).
    const focusables = section.getByRole('button')
    const count = await focusables.count()
    expect(count).toBeGreaterThan(0)

    for (let i = 0; i < count; i++) {
      await focusables.nth(i).focus()
      await expect(focusables.nth(i)).toBeFocused()
    }

    await expect(section.getByRole('button', { name: 'Open Architecture Table' })).toBeVisible()
  })

  test('Open Architecture Table still opens the dialog from the lab', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Open Architecture Table' }).first().click()
    await expect(page.getByRole('dialog', { name: 'Architecture Table' })).toBeVisible()
  })
})
