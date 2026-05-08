import { chromium, type Page, type BrowserContext } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';

const SOURCE_URL = 'http://localhost:4200';
const REACT_URL = 'http://localhost:5173';
const SOURCE_DIR = path.join(__dirname, 'screenshots', 'source');
const REACT_DIR = path.join(__dirname, 'screenshots', 'react');

const DESKTOP_VIEWPORT = { width: 1280, height: 800 };
const MOBILE_VIEWPORT = { width: 375, height: 812 };

const API_BASE = 'https://node-hnapi.herokuapp.com';

const DISABLE_ANIMATIONS_CSS = `
  *, *::before, *::after {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
    transition-duration: 0s !important;
    transition-delay: 0s !important;
  }
`;

interface RouteConfig {
  name: string;
  path: string;
  apiPath: string;
  waitFor?: string;
}

const ROUTES: RouteConfig[] = [
  { name: 'news', path: '/news/1', apiPath: '/news?page=1', waitFor: '.post' },
  { name: 'newest', path: '/newest/1', apiPath: '/newest?page=1', waitFor: '.post' },
  { name: 'show', path: '/show/1', apiPath: '/show?page=1', waitFor: '.post' },
  { name: 'ask', path: '/ask/1', apiPath: '/ask?page=1', waitFor: '.post' },
  { name: 'jobs', path: '/jobs/1', apiPath: '/jobs?page=1', waitFor: '.post' },
];

const THEMES = ['theme-default', 'theme-dark', 'theme-amoledblack'];

// Stored mock API responses for consistent data
const mockResponses: Map<string, string> = new Map();

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function fetchAndCacheMockData() {
  console.log('Fetching live API data to use as mock data...');

  for (const route of ROUTES) {
    const url = `${API_BASE}${route.apiPath}`;
    try {
      const response = await fetch(url);
      const data = await response.text();
      mockResponses.set(route.apiPath, data);
      console.log(`  Cached: ${route.apiPath}`);
    } catch (err) {
      console.error(`  Failed to fetch ${url}:`, err);
    }
  }
}

async function interceptAPI(page: Page) {
  await page.route('**/node-hnapi.herokuapp.com/**', (route) => {
    const url = new URL(route.request().url());
    const apiPath = url.pathname + url.search;

    const mockData = mockResponses.get(apiPath);
    if (mockData) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: mockData,
      });
    }

    return route.continue();
  });
}

async function capturePageScreenshot(
  context: BrowserContext,
  baseUrl: string,
  routePath: string,
  waitForSelector: string | undefined,
  outputPath: string
) {
  const page = await context.newPage();

  await interceptAPI(page);
  await page.goto(`${baseUrl}${routePath}`, { waitUntil: 'networkidle', timeout: 30000 });

  if (waitForSelector) {
    await page.waitForSelector(waitForSelector, { timeout: 15000 }).catch(() => {});
  }

  await page.waitForTimeout(1000);
  await page.addStyleTag({ content: DISABLE_ANIMATIONS_CSS });
  await page.waitForTimeout(300);

  await page.screenshot({ path: outputPath, fullPage: true });
  await page.close();
}

async function captureSettingsScreenshot(
  context: BrowserContext,
  baseUrl: string,
  theme: string,
  outputPath: string
) {
  const page = await context.newPage();

  await interceptAPI(page);

  // Set theme before loading
  await page.goto(`${baseUrl}/news/1`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForSelector('.post', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(500);

  await page.evaluate((t: string) => {
    const settings = JSON.parse(localStorage.getItem('settings') || '{}');
    settings.theme = t;
    localStorage.setItem('settings', JSON.stringify(settings));
  }, theme);

  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('.post', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(500);

  // Open settings panel
  await page.click('img.settings').catch(() => {
    return page.click('.settings').catch(() => {});
  });
  await page.waitForTimeout(500);

  await page.addStyleTag({ content: DISABLE_ANIMATIONS_CSS });
  await page.waitForTimeout(300);

  await page.screenshot({ path: outputPath, fullPage: true });
  await page.close();
}

async function captureBoth() {
  ensureDir(SOURCE_DIR);
  ensureDir(REACT_DIR);

  await fetchAndCacheMockData();

  const browser = await chromium.launch({ headless: true });

  for (const route of ROUTES) {
    for (const vp of [
      { name: 'desktop', ...DESKTOP_VIEWPORT },
      { name: 'mobile', ...MOBILE_VIEWPORT },
    ]) {
      const filename = `${route.name}-${vp.name}.png`;

      // Capture Angular source
      const srcCtx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      await capturePageScreenshot(
        srcCtx, SOURCE_URL, route.path, route.waitFor,
        path.join(SOURCE_DIR, filename)
      );
      await srcCtx.close();
      console.log(`Source: ${filename}`);

      // Capture React
      const reactCtx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      await capturePageScreenshot(
        reactCtx, REACT_URL, route.path, route.waitFor,
        path.join(REACT_DIR, filename)
      );
      await reactCtx.close();
      console.log(`React:  ${filename}`);
    }
  }

  // Capture settings for each theme
  for (const theme of THEMES) {
    for (const vp of [
      { name: 'desktop', ...DESKTOP_VIEWPORT },
      { name: 'mobile', ...MOBILE_VIEWPORT },
    ]) {
      const filename = `settings-${theme}-${vp.name}.png`;

      const srcCtx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      await captureSettingsScreenshot(srcCtx, SOURCE_URL, theme, path.join(SOURCE_DIR, filename));
      await srcCtx.close();
      console.log(`Source: ${filename}`);

      const reactCtx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      await captureSettingsScreenshot(reactCtx, REACT_URL, theme, path.join(REACT_DIR, filename));
      await reactCtx.close();
      console.log(`React:  ${filename}`);
    }
  }

  await browser.close();
  console.log('\nBoth captures complete! Run compare.ts to see results.');
}

captureBoth().catch(console.error);
