import { chromium, type Page, type Route } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import { mockFeedData, mockItemData, mockUserData, mockJobsData } from './mock-data';

const ANGULAR_URL = 'http://localhost:4200';
const REACT_URL = 'http://localhost:5173';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
const API_BASE = 'https://node-hnapi.herokuapp.com';

const DESKTOP = { width: 1280, height: 800 };
const MOBILE = { width: 375, height: 812 };

interface ViewConfig {
    name: string;
    path: string;
    waitForSelector?: string;
    actions?: (page: Page) => Promise<void>;
}

const views: ViewConfig[] = [
    { name: 'news-page1', path: '/news/1' },
    { name: 'newest-page1', path: '/newest/1' },
    { name: 'show-page1', path: '/show/1' },
    { name: 'ask-page1', path: '/ask/1' },
    { name: 'jobs-page1', path: '/jobs/1' },
    { name: 'item-detail', path: '/item/40000001' },
    { name: 'user-profile', path: '/user/pg' },
];

async function setupMockRoutes(page: Page): Promise<void> {
    await page.route(`${API_BASE}/**`, async (route: Route) => {
        const url = route.request().url();

        if (url.includes('/user/')) {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(mockUserData),
            });
        } else if (url.includes('/item/')) {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(mockItemData),
            });
        } else if (url.includes('/jobs')) {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(mockJobsData),
            });
        } else {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(mockFeedData),
            });
        }
    });
}

async function disableAnimations(page: Page): Promise<void> {
    await page.addStyleTag({
        content: `*, *::before, *::after { 
            transition: none !important; 
            animation: none !important; 
            transition-duration: 0s !important;
            animation-duration: 0s !important;
        }`
    });
}

async function captureScreenshots(
    page: Page,
    baseUrl: string,
    outputDir: string,
    viewport: { width: number; height: number },
    suffix: string
): Promise<void> {
    await page.setViewportSize(viewport);

    for (const view of views) {
        const url = `${baseUrl}${view.path}`;
        try {
            await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
        } catch {
            await page.goto(url, { waitUntil: 'load', timeout: 15000 });
            await page.waitForTimeout(2000);
        }
        await disableAnimations(page);
        await page.evaluate(() => (document as any).fonts?.ready);
        await page.waitForTimeout(500);

        if (view.actions) {
            await view.actions(page);
            await page.waitForTimeout(300);
        }

        const filename = `${view.name}-${suffix}.png`;
        await page.screenshot({
            path: path.join(outputDir, filename),
            fullPage: true,
        });
        console.log(`  Captured: ${filename}`);
    }
}

async function main(): Promise<void> {
    const sourceDir = path.join(SCREENSHOT_DIR, 'source');
    const reactDir = path.join(SCREENSHOT_DIR, 'react');

    fs.mkdirSync(sourceDir, { recursive: true });
    fs.mkdirSync(reactDir, { recursive: true });

    const browser = await chromium.launch({ headless: true });

    // Capture Angular (source) screenshots
    console.log('\n=== Capturing Angular (Source) Screenshots ===');
    const angularContext = await browser.newContext();
    const angularPage = await angularContext.newPage();
    await setupMockRoutes(angularPage);

    console.log('Desktop captures:');
    await captureScreenshots(angularPage, ANGULAR_URL, sourceDir, DESKTOP, 'desktop');
    console.log('Mobile captures:');
    await captureScreenshots(angularPage, ANGULAR_URL, sourceDir, MOBILE, 'mobile');
    await angularContext.close();

    // Capture React screenshots
    console.log('\n=== Capturing React Screenshots ===');
    const reactContext = await browser.newContext();
    const reactPage = await reactContext.newPage();
    await setupMockRoutes(reactPage);

    console.log('Desktop captures:');
    await captureScreenshots(reactPage, REACT_URL, reactDir, DESKTOP, 'desktop');
    console.log('Mobile captures:');
    await captureScreenshots(reactPage, REACT_URL, reactDir, MOBILE, 'mobile');
    await reactContext.close();

    await browser.close();
    console.log('\nAll screenshots captured!');
}

main().catch(console.error);
