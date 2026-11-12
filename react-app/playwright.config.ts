import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    reporter: process.env.CI ? 'list' : [['list'], ['html', { open: 'never' }]],
    use: {
        baseURL: `http://localhost:${PORT}`,
        trace: 'retain-on-failure',
    },
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
    webServer: {
        command: `npm run build && npx vite preview --port ${PORT} --strictPort`,
        url: `http://localhost:${PORT}`,
        reuseExistingServer: false,
        timeout: 180_000,
    },
});
