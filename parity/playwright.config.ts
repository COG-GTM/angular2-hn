import { defineConfig, devices } from '@playwright/test';

// Same specs run against the Angular 9 baseline (:4000) and the upgraded app (:4200).
export default defineConfig({
  testDir: './specs',
  timeout: 30_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  workers: 4,
  // The live smoke spec talks to the public HN APIs, so allow one retry.
  retries: 1,
  reporter: [['list'], ['json', { outputFile: 'report/results.json' }]],
  use: {
    ...devices['Desktop Chrome'],
    viewport: { width: 1280, height: 900 },
    colorScheme: 'light',
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'baseline', use: { baseURL: process.env.BASELINE_URL || 'http://localhost:4000' } },
    { name: 'upgraded', use: { baseURL: process.env.UPGRADED_URL || 'http://localhost:4200' } },
  ],
});
