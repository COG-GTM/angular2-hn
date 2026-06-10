import { defineConfig } from '@playwright/test';

/**
 * Cross-app visual parity configuration.
 *
 * Two projects run the same specs against the two apps:
 *   - `angular` -> the original Angular app (default http://localhost:4200)
 *   - `react`   -> the migrated React app   (default http://localhost:5173)
 *
 * Each spec additionally exercises desktop (1280x720) and mobile (375x812,
 * iPhone X) viewports by setting the viewport per test.
 */

const ANGULAR_BASE_URL = process.env.ANGULAR_BASE_URL || 'http://localhost:4200';
const REACT_BASE_URL = process.env.REACT_BASE_URL || 'http://localhost:5173';

export default defineConfig({
    testDir: './tests',
    fullyParallel: false,
    workers: 1,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    timeout: 60_000,
    expect: { timeout: 15_000 },
    reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
    use: {
        headless: true,
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true,
        trace: 'on-first-retry',
    },
    projects: [
        { name: 'angular', use: { baseURL: ANGULAR_BASE_URL } },
        { name: 'react', use: { baseURL: REACT_BASE_URL } },
    ],
});
