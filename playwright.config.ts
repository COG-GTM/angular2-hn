import { defineConfig, devices } from '@playwright/test';

const port = 4300;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  reporter: process.env['CI'] ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${port}`,
    trace: 'on-first-retry',
    serviceWorkers: 'block',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npx ng build && npx http-server dist/angular-hnpwa/browser -p ${port} -s -P http://localhost:${port}?`,
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env['CI'],
    timeout: 180_000,
  },
});
