// Lets context.route intercept requests made by the service worker (offline/PWA specs).
process.env.PW_EXPERIMENTAL_SERVICE_WORKER_NETWORK_EVENTS = '1';

import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT ?? 4173);
const DEVIN_CHROME_DIR = '/opt/.devin/chrome/chrome';

/** Local runs without `npx playwright install` fall back to the preinstalled Chrome (CI installs Chromium). */
function localChrome(): string | undefined {
    if (process.env.PLAYWRIGHT_CHROME_PATH) return process.env.PLAYWRIGHT_CHROME_PATH;
    if (process.env.CI || !existsSync(DEVIN_CHROME_DIR)) return undefined;
    return readdirSync(DEVIN_CHROME_DIR)
        .filter((dir) => dir.startsWith('linux-'))
        .map((dir) => join(DEVIN_CHROME_DIR, dir, 'chrome-linux64', 'chrome'))
        .find((path) => existsSync(path));
}

export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
    use: {
        baseURL: `http://localhost:${PORT}`,
        trace: 'retain-on-failure',
        // Once a SW controls the page its fetches bypass page.route mocks; SW/offline specs opt back in.
        serviceWorkers: 'block',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'], launchOptions: { executablePath: localChrome() } },
        },
    ],
    // Production build: the service worker and precache manifest only exist after `vite build`.
    webServer: {
        command: `npm run build && npx vite preview --port ${PORT} --strictPort`,
        url: `http://localhost:${PORT}`,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
    },
});
