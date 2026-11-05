import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  reporter: 'list',
  use: {
    trace: 'on-first-retry',
    ...devices['Desktop Chrome'],
  },
  projects: [
    {
      name: 'app',
      testIgnore: /pwa\.spec\.ts/,
      use: { baseURL: 'http://localhost:4200', serviceWorkers: 'block' },
    },
    {
      name: 'pwa',
      testMatch: /pwa\.spec\.ts/,
      use: { baseURL: 'http://localhost:4300' },
    },
  ],
  webServer: [
    {
      command: 'npx ng serve --port 4200',
      url: 'http://localhost:4200',
      reuseExistingServer: !process.env['CI'],
      timeout: 180_000,
    },
    {
      command: 'npx ng build && node e2e/serve-dist.mjs 4300',
      url: 'http://localhost:4300',
      reuseExistingServer: !process.env['CI'],
      timeout: 180_000,
    },
  ],
});
