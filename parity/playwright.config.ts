import { defineConfig } from '@playwright/test';

const executablePath = process.env.CHROME_BIN || undefined;

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  // the live specs hit the public HN API, which is occasionally slow
  retries: 1,
  reporter: [['list']],
  use: {
    viewport: { width: 1280, height: 900 },
    launchOptions: executablePath ? { executablePath, args: ['--no-sandbox'] } : {},
    serviceWorkers: 'block',
  },
  projects: [
    { name: 'baseline', use: { baseURL: process.env.BASELINE_URL || 'http://localhost:4000' } },
    { name: 'upgraded', use: { baseURL: process.env.UPGRADED_URL || 'http://localhost:4200' } },
  ],
});
