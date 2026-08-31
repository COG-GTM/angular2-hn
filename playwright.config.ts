import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './e2e-tests',
    use: { baseURL: 'http://127.0.0.1:4173', trace: 'retain-on-failure', serviceWorkers: 'block' },
    webServer: { command: 'npm run preview -- --host 127.0.0.1', url: 'http://127.0.0.1:4173', reuseExistingServer: false },
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
