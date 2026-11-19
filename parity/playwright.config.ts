import { defineConfig, devices } from '@playwright/test';

// Same specs, two apps: `legacy` = Angular 9 (master) on :4000, `angular21` = this branch on :4200.
// Both are production builds (service worker included); see scripts/serve-*.sh and README.md.
const apps = [
    { name: 'legacy', port: Number(process.env.LEGACY_PORT ?? 4000), script: 'scripts/serve-legacy.sh' },
    { name: 'angular21', port: Number(process.env.ANGULAR21_PORT ?? 4200), script: 'scripts/serve-angular21.sh' },
];

// Start only the servers for the projects that were asked for (all of them by default).
const requested = process.argv
    .flatMap((arg, i, argv) =>
        arg === '--project' ? [argv[i + 1]] : arg.startsWith('--project=') ? [arg.slice(10)] : []
    )
    .filter(Boolean);
const selected = requested.length ? apps.filter((app) => requested.includes(app.name)) : apps;

export default defineConfig({
    testDir: './specs',
    outputDir: './test-results',
    timeout: 60_000,
    expect: { timeout: 15_000 },
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 1,
    reporter: [['list'], ['html', { outputFolder: 'report/html', open: 'never' }]],
    use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 900 },
        colorScheme: 'light',
        serviceWorkers: 'block',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
    projects: apps.map((app) => ({ name: app.name, use: { baseURL: `http://localhost:${app.port}` } })),
    webServer: process.env.PARITY_NO_SERVER
        ? undefined
        : selected.map((app) => ({
              command: `bash ${app.script}`,
              url: `http://localhost:${app.port}`,
              reuseExistingServer: true,
              timeout: 15 * 60_000,
              stdout: 'pipe' as const,
          })),
});
