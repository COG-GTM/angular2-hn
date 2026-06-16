import { chromium, Browser, Route } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { VIEWS, VIEWPORTS, ITEM_ID, USER_ID, INVALID_ITEM_ID } from './config';

const API_HOST = 'node-hnapi.herokuapp.com';
const FIXTURES = path.join(__dirname, 'fixtures');

function readFixture(name: string): string {
  return fs.readFileSync(path.join(FIXTURES, name), 'utf-8');
}

// Map an intercepted API request to a fixture file (or null to force an error).
function resolveFixture(url: URL): string | null {
  const page = url.searchParams.get('page') || '1';
  const p = url.pathname.replace(/\/$/, '');

  const itemMatch = p.match(/^\/item\/(\d+)$/);
  if (itemMatch) {
    const id = Number(itemMatch[1]);
    if (id === ITEM_ID) return readFixture('item.json');
    if (id === INVALID_ITEM_ID) return null; // force error state
    return null;
  }

  const userMatch = p.match(/^\/user\/(.+)$/);
  if (userMatch) return readFixture('user.json');

  const feedMatch = p.match(/^\/(news|newest|show|ask|jobs)$/);
  if (feedMatch) {
    const feed = feedMatch[1];
    return readFixture(`${feed}_p${page}.json`);
  }

  return null;
}

async function handleRoute(route: Route) {
  const url = new URL(route.request().url());
  if (url.host !== API_HOST) {
    return route.continue();
  }
  const body = resolveFixture(url);
  if (body === null) {
    // Simulate a server error so the app shows its error state.
    return route.fulfill({ status: 500, contentType: 'text/plain', body: '' });
  }
  return route.fulfill({
    status: 200,
    contentType: 'application/json',
    headers: { 'access-control-allow-origin': '*' },
    body,
  });
}

export async function capture(baseUrl: string, outDir: string): Promise<void> {
  fs.mkdirSync(outDir, { recursive: true });
  const headed = process.env.HEADED === '1';
  const browser: Browser = await chromium.launch({ headless: !headed });

  let total = 0;
  for (const view of VIEWS) {
    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 1,
        colorScheme: 'light',
      });
      // Seed deterministic settings before any app code runs.
      await context.addInitScript((theme: string) => {
        try {
          localStorage.setItem('theme', theme);
          localStorage.setItem('openLinkInNewTab', 'false');
          localStorage.setItem('titleFontSize', '16');
          localStorage.setItem('listSpacing', '0');
        } catch (e) {
          /* ignore */
        }
      }, view.theme);

      const page = await context.newPage();
      await page.route('**/*', handleRoute);

      const target = baseUrl.replace(/\/$/, '') + view.path;
      await page.goto(target, { waitUntil: 'domcontentloaded' });

      try {
        await page.waitForSelector(view.waitFor, { timeout: 15000 });
      } catch (e) {
        console.warn(`  [warn] selector "${view.waitFor}" not found for ${view.prefix}-${vp.name}`);
      }

      if (view.click) {
        await page.click(view.click).catch(() => {});
      }
      await page.waitForTimeout(view.settleMs ?? 250);
      // Disable animations/transitions for stable diffs.
      await page.addStyleTag({
        content: `*, *::before, *::after { transition: none !important; animation: none !important; }`,
      });
      await page.waitForTimeout(50);

      const file = path.join(outDir, `${view.prefix}-${vp.name}.png`);
      await page.screenshot({ path: file, fullPage: true });
      total++;
      console.log(`  saved ${path.basename(file)}`);
      await context.close();
    }
  }

  await browser.close();
  console.log(`Done. Captured ${total} screenshots to ${outDir}`);
}
