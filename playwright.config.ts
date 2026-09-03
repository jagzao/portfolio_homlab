import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  reporter: 'list',
  // Each test spins up a real WebGL context; >4 concurrent Chromium
  // instances caused flaky ERR_ABORTED navigations under GPU/CPU
  // contention on a dev machine. Raise this only on a runner with
  // matching headroom (verify with a repeated-run check first).
  workers: 4,
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  // Build separately before running tests (`npm run build`) — a build baked
  // into webServer.command raced with itself under parallel workers/repeat
  // runs, corrupting dist/ mid-request and causing flaky ERR_ABORTED navigations.
  webServer: {
    command: 'npm run preview -- --port 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } },
  ],
})
