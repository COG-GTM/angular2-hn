import { Page, TestInfo, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const FIXTURES = path.join(__dirname, '..', 'fixtures');

export function fixture<T = any>(name: string): T {
  return JSON.parse(fs.readFileSync(path.join(FIXTURES, `${name}.json`), 'utf8'));
}

// Serve recorded HN API responses so both apps render identical data.
export async function mockApi(page: Page, opts: { fail?: boolean } = {}) {
  await page.route(/google-analytics\.com/, (route) => route.abort());
  await page.route(/node-hnapi\.herokuapp\.com|api\.hnpwa\.com/, async (route) => {
    if (opts.fail) {
      return route.abort('failed');
    }
    const url = new URL(route.request().url());
    let name: string | undefined;
    const feed = url.pathname.match(/^\/(news|newest|show|ask|jobs)$/);
    const item = url.pathname.match(/^\/item\/(\d+)$/);
    const user = url.pathname.match(/^\/v0\/user\/([^/]+)\.json$/);
    if (feed) name = `${feed[1]}-${url.searchParams.get('page') || 1}`;
    else if (item) name = `item-${item[1]}`;
    else if (user) name = `user-${user[1]}`;
    const file = name && path.join(FIXTURES, `${name}.json`);
    if (!file || !fs.existsSync(file)) {
      return route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: fs.readFileSync(file, 'utf8'),
    });
  });
}

export async function shot(page: Page, testInfo: TestInfo, name: string) {
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.waitForTimeout(300);
  const dir = path.join(__dirname, '..', 'report', 'screens', testInfo.project.name);
  fs.mkdirSync(dir, { recursive: true });
  await page.screenshot({ path: path.join(dir, `${name}.png`), fullPage: true, animations: 'disabled' });
}

export async function waitForFeed(page: Page) {
  await expect(page.locator('li.post').first()).toBeVisible();
}
