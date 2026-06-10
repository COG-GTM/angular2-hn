import { defineConfig, devices } from '@playwright/test';

/**
 * Visual regression config for the Angular -> React migration.
 *
 * Two projects render the SAME scenario matrix:
 *  - `angular` against the Angular dev server (http://localhost:4200) -> generates baselines
 *  - `react`   against the React (Vite) dev server (http://localhost:5173) -> compared against baselines
 *
 * snapshotPathTemplate intentionally omits {projectName}/{platform} so both projects resolve
 * to the same PNG files under tests/visual-regression/__screenshots__/. Generate baselines with:
 *   npx playwright test --project=angular --update-snapshots
 * then verify the port with:
 *   npx playwright test --project=react
 */
export default defineConfig({
    testDir: './tests/visual-regression',
    snapshotPathTemplate: '{testDir}/__screenshots__/{arg}{ext}',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: 0,
    workers: process.env.CI ? 2 : 4,
    reporter: [['list'], ['html', { open: 'never' }]],
    expect: {
        toHaveScreenshot: {
            maxDiffPixelRatio: 0.01,
            animations: 'disabled',
        },
    },
    use: {
        ignoreHTTPSErrors: true,
    },
    projects: [
        {
            name: 'angular',
            testMatch: /angular\.spec\.ts$/,
            use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:4200' },
        },
        {
            name: 'react',
            testMatch: /react\.spec\.ts$/,
            use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:5173' },
        },
    ],
});
