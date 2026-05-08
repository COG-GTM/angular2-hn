import { chromium } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';

const REACT_URL = 'http://localhost:5173';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots', 'react');

const DESKTOP_VIEWPORT = { width: 1280, height: 800 };
const MOBILE_VIEWPORT = { width: 375, height: 812 };

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
  waitFor?: string;
}

const ROUTES: RouteConfig[] = [
  { name: 'news', path: '/news/1', waitFor: '.post' },
  { name: 'newest', path: '/newest/1', waitFor: '.post' },
  { name: 'show', path: '/show/1', waitFor: '.post' },
  { name: 'ask', path: '/ask/1', waitFor: '.post' },
  { name: 'jobs', path: '/jobs/1', waitFor: '.post' },
];

const THEMES = ['default', 'night', 'amoledblack'];

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function captureReact() {
  ensureDir(SCREENSHOT_DIR);

  const browser = await chromium.launch({ headless: true });

  for (const route of ROUTES) {
    for (const viewport of [
      { name: 'desktop', ...DESKTOP_VIEWPORT },
      { name: 'mobile', ...MOBILE_VIEWPORT },
    ]) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
      });
      const page = await context.newPage();

      await page.goto(`${REACT_URL}${route.path}`, { waitUntil: 'networkidle' });

      if (route.waitFor) {
        await page.waitForSelector(route.waitFor, { timeout: 15000 }).catch(() => {});
      }

      await page.waitForTimeout(1000);
      await page.addStyleTag({ content: DISABLE_ANIMATIONS_CSS });

      const filename = `${route.name}-${viewport.name}.png`;
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, filename), fullPage: true });
      console.log(`Captured: ${filename}`);

      await context.close();
    }
  }

  // Capture settings panel with each theme
  for (const theme of THEMES) {
    for (const viewport of [
      { name: 'desktop', ...DESKTOP_VIEWPORT },
      { name: 'mobile', ...MOBILE_VIEWPORT },
    ]) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
      });
      const page = await context.newPage();

      await page.goto(`${REACT_URL}/news/1`, { waitUntil: 'networkidle' });
      await page.waitForSelector('.post', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(500);

      // Set theme via localStorage
      await page.evaluate((t: string) => {
        localStorage.setItem('theme', t);
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

      const filename = `settings-${theme}-${viewport.name}.png`;
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, filename), fullPage: true });
      console.log(`Captured: ${filename}`);

      await context.close();
    }
  }

  await browser.close();
  console.log('React capture complete!');
}

captureReact().catch(console.error);
