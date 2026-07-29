import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'list',
    use: {
        baseURL: `http://localhost:${PORT}`,
        trace: 'on-first-retry',
        // Playwright cannot intercept requests a service worker makes, so the
        // mocked API would be bypassed once the worker controls the page.
        // pwa.spec.ts opts back in to exercise the worker itself.
        serviceWorkers: 'block',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    webServer: {
        command: `npm run preview -- --port ${PORT} --strictPort`,
        url: `http://localhost:${PORT}/news/1`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
    },
});
