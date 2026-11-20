import { Page, TestInfo } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const fixturesDir = path.join(__dirname, '..', 'fixtures');

function fixtureFor(url: URL): string | undefined {
  if (url.hostname === 'api.hnpwa.com') {
    const m = url.pathname.match(/^\/v0\/user\/([^/]+)\.json$/);
    return m ? `user-${m[1]}.json` : undefined;
  }
  const item = url.pathname.match(/^\/item\/(\d+)$/);
  if (item) {
    return `item-${item[1]}.json`;
  }
  const feed = url.pathname.match(/^\/(news|newest|show|ask|jobs)$/);
  if (feed) {
    return `${feed[1]}-${url.searchParams.get('page') || 1}.json`;
  }
  return undefined;
}

/** Serve recorded HN API responses so both apps render identical data. */
export async function useFixtures(page: Page) {
  await page.route(/google-analytics\.com/, route => route.fulfill({ status: 204, body: '' }));
  await page.route(/(node-hnapi\.herokuapp\.com|api\.hnpwa\.com)/, route => {
    const name = fixtureFor(new URL(route.request().url()));
    const file = name && path.join(fixturesDir, name);
    if (!file || !fs.existsSync(file)) {
      return route.fulfill({ status: 404, body: 'no fixture' });
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: fs.readFileSync(file),
    });
  });
}

export function fixture<T = any>(name: string): T {
  return JSON.parse(fs.readFileSync(path.join(fixturesDir, name), 'utf8'));
}

/** Full-page screenshot into report/screens/<project>/<name>.png for compare.mjs. */
export async function snap(page: Page, testInfo: TestInfo, name: string) {
  const dir = path.join(__dirname, '..', 'report', 'screens', testInfo.project.name);
  fs.mkdirSync(dir, { recursive: true });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(dir, `${name}.png`), fullPage: true, animations: 'disabled' });
}
