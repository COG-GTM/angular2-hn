import { defineConfig, devices } from '@playwright/test';

const BASELINE_URL = process.env.BASELINE_URL ?? 'http://localhost:4000';
const REACT_URL = process.env.REACT_URL ?? 'http://localhost:4300';

export default defineConfig({
  testDir: './specs',
  outputDir: './test-results',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    ...devices['Desktop Chrome'],
    viewport: { width: 1280, height: 800 },
    serviceWorkers: 'block',
    colorScheme: 'light',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'baseline', use: { baseURL: BASELINE_URL } },
    { name: 'react', use: { baseURL: REACT_URL } },
  ],
});
