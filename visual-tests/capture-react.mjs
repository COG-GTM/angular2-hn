import { chromium } from 'playwright';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const REACT_URL = process.env.REACT_URL || 'http://localhost:5175';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots', 'react');

const mockNews = JSON.parse(readFileSync(path.join(__dirname, 'mock-data', 'news.json'), 'utf-8'));
const mockItem = JSON.parse(readFileSync(path.join(__dirname, 'mock-data', 'item.json'), 'utf-8'));
const mockUser = JSON.parse(readFileSync(path.join(__dirname, 'mock-data', 'user.json'), 'utf-8'));

const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile', width: 375, height: 812 },
];

const ROUTES = [
  { path: '/news/1', name: 'news' },
  { path: '/newest/1', name: 'newest' },
  { path: '/show/1', name: 'show' },
  { path: '/ask/1', name: 'ask' },
  { path: '/jobs/1', name: 'jobs' },
  { path: '/item/1', name: 'item-detail' },
  { path: '/user/testuser1', name: 'user-profile' },
];

const THEMES = ['default', 'night', 'amoledblack'];

async function setupMockRoutes(page) {
  await page.route('**/node-hnapi.herokuapp.com/**', async (route) => {
    const url = route.request().url();
    if (url.includes('/user/')) {
      await route.fulfill({ json: mockUser });
    } else if (url.includes('/item/')) {
      await route.fulfill({ json: mockItem });
    } else {
      await route.fulfill({ json: mockNews });
    }
  });
}

async function disableAnimations(page) {
  await page.addStyleTag({
    content: `*, *::before, *::after {
      animation-duration: 0s !important;
      animation-delay: 0s !important;
      transition-duration: 0s !important;
      transition-delay: 0s !important;
    }`
  });
}

async function setTheme(page, theme) {
  await page.evaluate((t) => {
    localStorage.setItem('theme', t);
  }, theme);
}

async function captureScreenshots() {
  const browser = await chromium.launch({ headless: true });

  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
    });
    const page = await context.newPage();
    await setupMockRoutes(page);

    // Capture all routes with default theme
    for (const route of ROUTES) {
      await page.goto(`${REACT_URL}${route.path}`, { waitUntil: 'networkidle' });
      await disableAnimations(page);
      await page.waitForTimeout(500);

      const filename = `${route.name}-${viewport.name}.png`;
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, filename),
        fullPage: true,
      });
      console.log(`Captured: ${filename}`);
    }

    // Capture settings panel in all themes
    for (const theme of THEMES) {
      await setTheme(page, theme);
      await page.goto(`${REACT_URL}/news/1`, { waitUntil: 'networkidle' });
      await disableAnimations(page);

      // Open settings panel by clicking the gear icon
      const settingsBtn = page.locator('.settings-btn, .cog-btn, [class*="settings"]').first();
      if (await settingsBtn.count() > 0) {
        await settingsBtn.click();
        await page.waitForTimeout(300);
      }

      const filename = `settings-${theme}-${viewport.name}.png`;
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, filename),
        fullPage: true,
      });
      console.log(`Captured: ${filename}`);
    }

    await context.close();
  }

  await browser.close();
  console.log('All React screenshots captured.');
}

captureScreenshots().catch(console.error);
