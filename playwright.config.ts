import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://localhost:4200/';

export default defineConfig({
  testDir: './e2e/src',
  testMatch: '**/*.e2e-spec.ts',
  timeout: 30000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm start',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      // Angular 9's webpack 4 uses MD4 hashing, which OpenSSL 3 (Node 17+) disables by default.
      NODE_OPTIONS: '--openssl-legacy-provider',
    },
  },
});
