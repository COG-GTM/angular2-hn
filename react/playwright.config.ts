import { defineConfig } from '@playwright/test';

const baseURL = process.env.BASE_URL ?? 'http://localhost:5173';

export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    reporter: [['list']],
    use: {
        baseURL,
        browserName: 'chromium',
        colorScheme: 'light',
        deviceScaleFactor: 1,
    },
    webServer: process.env.BASE_URL
        ? undefined
        : { command: 'npm run dev -- --port 5173 --strictPort', url: baseURL, reuseExistingServer: true },
});
