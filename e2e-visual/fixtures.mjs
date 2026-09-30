import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { API_BASE, fixtureFile } from './config.mjs';

const fixturesDir = new URL('./fixtures/', import.meta.url);

export async function installFixtures(context) {
  await context.route(/google-analytics\.com|googletagmanager\.com/, (route) => route.abort());
  await context.route(`${API_BASE}/**`, async (route) => {
    const url = new URL(route.request().url());
    const file = new URL(fixtureFile(url.pathname + url.search), fixturesDir);
    if (!existsSync(file)) {
      console.warn('  no fixture for', url.pathname + url.search);
      return route.fulfill({ status: 404, body: 'not found' });
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: await readFile(file),
    });
  });
}
