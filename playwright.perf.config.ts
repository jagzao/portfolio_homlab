import { defineConfig, devices } from '@playwright/test'

/**
 * Reference-profile performance config. Uses the real installed Chrome with
 * hardware acceleration (not headless SwiftShader) so frame-time / GPU
 * measurements reflect the actual reference machine's GPU, per the accepted
 * methodology in external review 5134770762. This config is used ONLY for the
 * reference-profile performance gate; the main playwright.config.ts (headless,
 * CI) is unchanged.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  reporter: [['list']],
  workers: 1,
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
    channel: 'chrome',
    headless: false,
    launchOptions: {
      args: [
        '--use-gl=angle',
        '--use-angle=gl',
        '--ignore-gpu-blocklist',
        '--enable-gpu-rasterization',
        '--enable-zero-copy',
      ],
    },
  },
  webServer: {
    command: 'npm run preview -- --port 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } } },
  ],
})
