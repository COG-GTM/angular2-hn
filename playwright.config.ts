import { defineConfig, devices } from '@playwright/test';

// Angular 9 (webpack 4) fails to build on Node 17+ unless the legacy OpenSSL
// provider is enabled. Only pass the flag on newer Node versions so the config
// keeps working on the Node 12/13 versions this app officially targets.
const nodeMajor = parseInt(process.versions.node.split('.')[0], 10);
const webServerEnv = nodeMajor >= 17 ? { NODE_OPTIONS: '--openssl-legacy-provider' } : {};

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4200',
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
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: webServerEnv,
  },
});
