import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test as base, expect, type Page, type TestInfo } from '@playwright/test';

const here = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(here, '..', 'fixtures');
const screenshotsDir = join(here, '..', 'screenshots');

export function fixture<T = any>(name: string): T {
  return JSON.parse(readFileSync(join(fixturesDir, `${name}.json`), 'utf8'));
}

function fixtureBody(name: string): string | null {
  const file = join(fixturesDir, `${name}.json`);
  return existsSync(file) ? readFileSync(file, 'utf8') : null;
}

export type Overrides = Record<string, { status: number; body: string }>;

/** Serves both HN APIs (node-hnapi for feeds/items, HNPWA for users) from parity/fixtures. */
export async function mockHnApi(page: Page, overrides: Overrides = {}) {
  await page.route(/google-analytics\.com/, (route) => route.fulfill({ status: 204, body: '' }));
  const handler = async (route: import('@playwright/test').Route) => {
    const url = new URL(route.request().url());
    let key: string | null = null;
    let m: RegExpMatchArray | null;
    if ((m = url.pathname.match(/^\/(news|newest|show|ask|jobs)$/))) key = `${m[1]}-${url.searchParams.get('page') ?? 1}`;
    else if ((m = url.pathname.match(/^\/(?:v0\/)?(news|newest|show|ask|jobs)\/(\d+)\.json$/))) key = `${m[1]}-${m[2]}`;
    else if ((m = url.pathname.match(/^\/(?:v0\/)?item\/(\d+)(?:\.json)?$/))) key = `item-${m[1]}`;
    else if ((m = url.pathname.match(/^\/(?:v0\/)?user\/([^/]+?)(?:\.json)?$/))) key = `user-${m[1]}`;
    if (key && overrides[key]) {
      return route.fulfill({ status: overrides[key].status, contentType: 'text/html', body: overrides[key].body });
    }
    const body = key ? fixtureBody(key) : null;
    if (body === null) return route.fulfill({ status: 404, contentType: 'text/html', body: '<pre>Cannot GET</pre>' });
    return route.fulfill({ status: 200, contentType: 'application/json', body });
  };
  await page.route(/node-hnapi\.herokuapp\.com/, handler);
  await page.route(/api\.hnpwa\.com/, handler);
}

export async function snap(page: Page, testInfo: TestInfo, name: string) {
  const dir = join(screenshotsDir, testInfo.project.name);
  mkdirSync(dir, { recursive: true });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(dir, `${name}.png`), fullPage: true, animations: 'disabled' });
}

export const MOBILE = { width: 390, height: 844 };

export const test = base.extend<{ hn: void }>({
  hn: [
    async ({ page }, use) => {
      await mockHnApi(page);
      await use();
    },
    { auto: true },
  ],
});

export { expect };

export function commentLabel(count: number) {
  if (count > 0) return `${count} ${count === 1 ? 'comment' : 'comments'}`;
  return 'discuss';
}

export function countComments(comments: any[] = []): number {
  return comments.reduce((n, c) => n + 1 + countComments(c.comments), 0);
}
