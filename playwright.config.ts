import { defineConfig, devices } from '@playwright/test';

const PORT = 5173;
const baseURL = `http://localhost:${PORT}`;

// E2E tests are opt-in (`npm run e2e`) and are not part of the unit-test/CI build.
// Some specs exercise live data from the Hacker News API.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
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
    command: 'npm run dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
