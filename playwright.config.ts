import { defineConfig } from '@playwright/test';

// Lets context.route() see requests made from inside the Angular service worker.
process.env.PW_EXPERIMENTAL_SERVICE_WORKER_NETWORK_EVENTS = '1';

const PORT = 4321;

export default defineConfig({
  testDir: './e2e-playwright',
  timeout: 60000,
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    viewport: { width: 1280, height: 800 },
    launchOptions: process.env.CHROME_BIN ? { executablePath: process.env.CHROME_BIN } : {},
  },
  // Requires a production build first: `npm run build -- --prod`.
  webServer: {
    command: `node e2e-playwright/serve.js dist/angular-hnpwa ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
  },
});
