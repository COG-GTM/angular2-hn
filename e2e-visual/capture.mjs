// Screenshots every route x theme x viewport against a running app, serving API calls from fixtures/.
// Usage: node capture.mjs --base-url http://localhost:4200 --out ../reference-screenshots
import { chromium } from 'playwright';
import { mkdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { parseArgs } from 'node:util';
import path from 'node:path';
import { API_BASE, ROUTES, THEMES, VIEWPORTS, fixtureFile } from './config.mjs';

const { values } = parseArgs({
  options: {
    'base-url': { type: 'string', default: 'http://localhost:4200' },
    out: { type: 'string', default: 'screenshots' },
    only: { type: 'string' },
  },
});
const baseUrl = values['base-url'].replace(/\/$/, '');
const outDir = path.resolve(values.out);
const only = values.only ? new RegExp(values.only) : null;
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

async function waitForContent(page) {
  await page.waitForLoadState('networkidle');
  await page.waitForFunction(() => !document.querySelector('.loader'), null, { timeout: 15000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
}

const browser = await chromium.launch();
let count = 0;
for (const [vpName, viewport] of Object.entries(VIEWPORTS)) {
  for (const theme of THEMES) {
    for (const route of ROUTES) {
      const name = `${route.name}--${theme}--${vpName}`;
      if (only && !only.test(name)) continue;
      const context = await browser.newContext({ viewport, colorScheme: 'light', deviceScaleFactor: 1 });
      await context.addInitScript((t) => window.localStorage.setItem('theme', t), theme);
      await installFixtures(context);
      const page = await context.newPage();
      await page.goto(baseUrl + route.path);
      await waitForContent(page);
      if (route.action === 'openSettings') {
        await page.click('img.settings');
        await page.waitForSelector('.popup');
      }
      await mkdir(outDir, { recursive: true });
      await page.screenshot({
        path: path.join(outDir, `${name}.png`),
        fullPage: true,
        animations: 'disabled',
        caret: 'hide',
      });
      console.log('captured', name);
      count++;
      await context.close();
    }
  }
}
await browser.close();
console.log(`${count} screenshots -> ${outDir}`);
