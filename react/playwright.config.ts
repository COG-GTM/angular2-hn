import { defineConfig } from '@playwright/test';

// Two static servers serve the pre-built Angular and React apps. Both apps call
// the same live API base (node-hnapi.herokuapp.com), which the tests intercept
// with the shared fixtures, so the parity comparison is deterministic.
export const ANGULAR_PORT = 4210;
export const REACT_PORT = 4211;

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: /.*\.spec\.ts/,
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  reporter: [['list']],
  webServer: [
    {
      command: `node tests/e2e/static-server.mjs ../dist/angular-hnpwa ${ANGULAR_PORT}`,
      port: ANGULAR_PORT,
      reuseExistingServer: !process.env.CI,
      timeout: 60000,
    },
    {
      command: `node tests/e2e/static-server.mjs ./dist ${REACT_PORT}`,
      port: REACT_PORT,
      reuseExistingServer: !process.env.CI,
      timeout: 60000,
    },
  ],
  use: {
    trace: 'off',
  },
});
