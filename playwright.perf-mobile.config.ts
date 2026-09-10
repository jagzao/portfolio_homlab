import { defineConfig, devices } from '@playwright/test'

/**
 * Reference-profile mobile-4G Web Vitals config. Applies 4 Mbps / 150ms RTT
 * network throttling via CDP and a mobile viewport, per the accepted
 * methodology in external review 5134770762 / re-audit 5136245139. Used ONLY
 * for the mobile-4G LCP/CLS gate; the main playwright.config.ts (CI) is
 * unchanged.
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
    { name: 'mobile-4g', use: { ...devices['Pixel 7'] } },
  ],
})
