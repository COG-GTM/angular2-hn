import { test, expect, type Page, type Route } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { ANGULAR_PORT, REACT_PORT } from '../../playwright.config';

const ANGULAR = `http://localhost:${ANGULAR_PORT}`;
const REACT = `http://localhost:${REACT_PORT}`;

const FIXTURES_DIR = join(dirname(fileURLToPath(import.meta.url)), '../../../fixtures');

function loadFixture(name: string): unknown {
  return JSON.parse(readFileSync(join(FIXTURES_DIR, name), 'utf-8'));
}

// Mirrors fixtures/resolve.ts, inlined so the Playwright loader has no
// cross-package module-interop issues.
function resolveFixture(pathname: string, page?: string): unknown | null {
  const path = pathname.replace(/^\//, '');
  const feedMatch = path.match(/^(news|newest|show|ask|jobs)$/);
  try {
    if (feedMatch) {
      return loadFixture(`feed-${feedMatch[1]}-${page || '1'}.json`);
    }
    const itemMatch = path.match(/^item\/(\d+)$/);
    if (itemMatch) {
      return loadFixture(`item-${itemMatch[1]}.json`);
    }
    const userMatch = path.match(/^user\/(.+)$/);
    if (userMatch) {
      return loadFixture(`user-${userMatch[1]}.json`);
    }
  } catch {
    return null;
  }
  return null;
}

// Serve the shared fixtures to whichever app makes the request, so both
// implementations render from identical data.
async function mockApi(page: Page) {
  await page.route('**/node-hnapi.herokuapp.com/**', (route: Route) => {
    const url = new URL(route.request().url());
    const pageParam = url.searchParams.get('page') ?? undefined;
    const data = resolveFixture(url.pathname, pageParam);
    if (data === null) {
      return route.abort('failed');
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(data),
    });
  });
}

// Collapse whitespace so framework-specific formatting differences don't matter.
function normalize(text: string): string {
  return text.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

interface Probe {
  text: string;
  wrapperClass: string;
  postCount: number;
  olStart: string | null;
  moreCount: number;
  prevCount: number;
  pollBars: string[];
  commentTextCount: number;
  errorText: string | null;
}

async function probe(page: Page): Promise<Probe> {
  return page.evaluate(() => {
    const wrapperEl = document.querySelector('.wrapper');
    const contentEl =
      document.querySelector('.main-content') ||
      document.querySelector('.profile') ||
      wrapperEl;
    const bars = Array.from(document.querySelectorAll('.pollBar')).map(
      (b) => (b as HTMLElement).style.width
    );
    const errorEl = document.querySelector('.error-section .strong');
    // theme wrapper is the outermost app div
    const themed = document.querySelector('body > div, #root > div, app-root > div');
    return {
      text: (contentEl as HTMLElement)?.innerText || '',
      wrapperClass: themed ? (themed as HTMLElement).className : '',
      postCount: document.querySelectorAll('li.post').length,
      olStart: document.querySelector('ol')?.getAttribute('start') ?? null,
      moreCount: document.querySelectorAll('.more').length,
      prevCount: document.querySelectorAll('.prev').length,
      pollBars: bars,
      commentTextCount: document.querySelectorAll('.comment-text').length,
      errorText: errorEl ? (errorEl as HTMLElement).innerText.trim() : null,
    };
  });
}

async function loadProbe(page: Page, base: string, path: string, waitFor: string) {
  await mockApi(page);
  await page.goto(`${base}${path}`);
  await page.waitForSelector(waitFor, { timeout: 15000 });
  // allow poll option / async summation to settle
  await page.waitForTimeout(300);
  return probe(page);
}

function expectParity(a: Probe, r: Probe) {
  expect(normalize(r.text)).toBe(normalize(a.text));
  expect(r.postCount).toBe(a.postCount);
  expect(r.olStart).toBe(a.olStart);
  expect(r.moreCount).toBe(a.moreCount);
  expect(r.prevCount).toBe(a.prevCount);
  expect(r.pollBars).toEqual(a.pollBars);
  expect(r.commentTextCount).toBe(a.commentTextCount);
  expect(r.errorText).toBe(a.errorText);
}

const cases: { name: string; path: string; waitFor: string }[] = [
  { name: 'news page 1 (30 items, More)', path: '/news/1', waitFor: 'li.post' },
  { name: 'news page 2 (5 items, Prev)', path: '/news/2', waitFor: 'li.post' },
  { name: 'newest page 1', path: '/newest/1', waitFor: 'li.post' },
  { name: 'show page 1', path: '/show/1', waitFor: 'li.post' },
  { name: 'ask page 1', path: '/ask/1', waitFor: 'li.post' },
  { name: 'jobs page 1 (job header)', path: '/jobs/1', waitFor: '.job-header' },
  { name: 'item with nested + deleted comments', path: '/item/1001', waitFor: '.comment-list' },
  { name: 'item external link', path: '/item/1002', waitFor: '.subtext' },
  { name: 'poll item with bars', path: '/item/300', waitFor: '.pollResults' },
  { name: 'user profile', path: '/user/user1', waitFor: '.profile' },
];

for (const c of cases) {
  test(`parity: ${c.name}`, async ({ browser }) => {
    const ctx = await browser.newContext();
    const angularPage = await ctx.newPage();
    const reactPage = await ctx.newPage();
    const a = await loadProbe(angularPage, ANGULAR, c.path, c.waitFor);
    const r = await loadProbe(reactPage, REACT, c.path, c.waitFor);
    expectParity(a, r);
    await ctx.close();
  });
}

test('parity: feed error state', async ({ browser }) => {
  const ctx = await browser.newContext();
  const angularPage = await ctx.newPage();
  const reactPage = await ctx.newPage();
  const a = await loadProbe(angularPage, ANGULAR, '/news/999', '.error-section');
  const r = await loadProbe(reactPage, REACT, '/news/999', '.error-section');
  expect(r.errorText).toBe(a.errorText);
  await ctx.close();
});

test('parity: comment collapse hides nested text in both apps', async ({ browser }) => {
  const ctx = await browser.newContext();
  const angularPage = await ctx.newPage();
  const reactPage = await ctx.newPage();
  await mockApi(angularPage);
  await mockApi(reactPage);

  for (const [page, base] of [
    [angularPage, ANGULAR],
    [reactPage, REACT],
  ] as [Page, string][]) {
    await page.goto(`${base}/item/1001`);
    await page.waitForSelector('.comment-list');
    await expect(page.locator('text=Top level comment')).toBeVisible();
    await page.locator('.collapse').first().click();
    await expect(page.locator('text=Top level comment')).toBeHidden();
  }
  await ctx.close();
});

test('parity: theme switch adds night class and persists in both apps', async ({ browser }) => {
  const ctx = await browser.newContext();
  const angularPage = await ctx.newPage();
  const reactPage = await ctx.newPage();

  for (const [page, base] of [
    [angularPage, ANGULAR],
    [reactPage, REACT],
  ] as [Page, string][]) {
    await mockApi(page);
    await page.goto(`${base}/news/1`);
    await page.waitForSelector('li.post');
    await page.locator('.settings-toggle, [alt="Settings"], .cog').first().click();
    await page.locator('input[value="night"]').click();
    const themed = page.locator('.night').first();
    await expect(themed).toHaveCount(1);
    const stored = await page.evaluate(() => localStorage.getItem('theme'));
    expect(stored).toBe('night');
  }
  await ctx.close();
});
