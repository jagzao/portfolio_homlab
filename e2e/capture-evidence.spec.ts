import { test } from '@playwright/test'
import path from 'node:path'

const EVIDENCE_DIR = process.env.EVIDENCE_DIR ?? 'evidence'

test.describe('visual evidence capture (not a correctness assertion — see smoke.spec.ts for that)', () => {
  test('initial semantic shell', async ({ page }, testInfo) => {
    await page.goto('/')
    await page.screenshot({ path: path.join(EVIDENCE_DIR, `${testInfo.project.name}-01-semantic-shell.png`) })
  })

  test('3D active state', async ({ page }, testInfo) => {
    await page.goto('/')
    await page.getByRole('button', { name: /enter homelab/i }).click()
    await page.locator('canvas').waitFor({ state: 'visible' })
    await page.waitForTimeout(300) // let the first frame(s) render
    await page.screenshot({ path: path.join(EVIDENCE_DIR, `${testInfo.project.name}-02-3d-active.png`) })
  })

  test('WebGL-unavailable notice', async ({ page }, testInfo) => {
    await page.addInitScript(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      HTMLCanvasElement.prototype.getContext = (() => null) as any
    })
    await page.goto('/')
    await page.getByRole('button', { name: /enter homelab/i }).click()
    await page.getByRole('alert').waitFor({ state: 'visible' })
    await page.screenshot({ path: path.join(EVIDENCE_DIR, `${testInfo.project.name}-03-webgl-unavailable.png`) })
  })

  test('data-saver notice with Try 3D opt-in', async ({ page }, testInfo) => {
    await page.addInitScript(() => {
      Object.defineProperty(window.navigator, 'connection', {
        value: { saveData: true },
        configurable: true,
      })
    })
    await page.goto('/')
    await page.getByRole('button', { name: /enter homelab/i }).click()
    await page.getByRole('alert').waitFor({ state: 'visible' })
    await page.screenshot({ path: path.join(EVIDENCE_DIR, `${testInfo.project.name}-04-data-saver-notice.png`) })
  })

  test('reduced motion, 3D active', async ({ page }, testInfo) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await page.getByRole('button', { name: /enter homelab/i }).click()
    await page.locator('canvas').waitFor({ state: 'visible' })
    await page.waitForTimeout(300)
    await page.screenshot({ path: path.join(EVIDENCE_DIR, `${testInfo.project.name}-05-reduced-motion.png`) })
  })

  test('loading 3D state', async ({ page }, testInfo) => {
    // Delay the lazy chunk so the Suspense fallback is guaranteed visible
    // long enough to capture, instead of racing a fast local network.
    await page.route('**/Experience3D-*.js', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      await route.continue()
    })
    await page.goto('/')
    await page.getByRole('button', { name: /enter homelab/i }).click()
    await page.getByRole('status').waitFor({ state: 'visible' })
    await page.screenshot({ path: path.join(EVIDENCE_DIR, `${testInfo.project.name}-06-loading-3d.png`) })
  })

  test('recoverable 3D load failure', async ({ page }, testInfo) => {
    // Corrupt the lazy chunk response so the dynamic import() rejects at
    // runtime, exercising the same path a real WebGL init failure would.
    await page.route('**/Experience3D-*.js', async (route) => {
      await route.fulfill({ contentType: 'application/javascript', body: 'throw new Error("simulated chunk failure")' })
    })
    await page.goto('/')
    await page.getByRole('button', { name: /enter homelab/i }).click()
    const notice = page.getByRole('alert')
    await notice.waitFor({ state: 'visible' })
    await page.screenshot({ path: path.join(EVIDENCE_DIR, `${testInfo.project.name}-07-recoverable-failure.png`) })
  })
})
