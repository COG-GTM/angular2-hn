import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './parity',
    testMatch: '**/*.spec.ts',
    fullyParallel: false,
    workers: 1,
    reporter: [['list']],
    timeout: 90_000,
    use: {
        headless: true,
    },
});
