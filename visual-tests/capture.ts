import * as fs from 'fs';
import * as path from 'path';
import { chromium } from 'playwright';
import { mockApi } from './mocks';
import { VIEWPORTS, VIEWS, View, Viewport } from './matrix';

const NO_MOTION = `*, *::before, *::after {
    transition: none !important;
    animation: none !important;
    caret-color: transparent !important;
}`;

export const screenshotDir = (target: string): string => path.join(__dirname, 'screenshots', target);

async function captureView(
    baseUrl: string,
    outDir: string,
    view: View,
    viewport: Viewport,
    browser: import('playwright').Browser
): Promise<void> {
    const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 1,
        colorScheme: 'light',
        reducedMotion: 'reduce',
    });
    await mockApi(context, Boolean(view.failApi));
    const storage = view.storage ?? {};
    await context.addInitScript((entries: Record<string, string>) => {
        for (const [key, value] of Object.entries(entries)) {
            window.localStorage.setItem(key, value);
        }
    }, storage);

    const page = await context.newPage();
    await page.goto(`${baseUrl}${view.path}`, { waitUntil: 'domcontentloaded' });
    await page.addStyleTag({ content: NO_MOTION });
    if (view.waitFor) {
        await page.waitForSelector(view.waitFor, { state: 'attached', timeout: 30000 });
    }
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => document.fonts.ready);
    if (view.interact) {
        await view.interact(page);
    }
    await page.waitForTimeout(300);

    const file = path.join(outDir, `${view.name}-${viewport.name}.png`);
    await page.screenshot({ path: file, fullPage: true, animations: 'disabled' });
    await context.close();
}

export async function capture(target: string, baseUrl: string): Promise<void> {
    const outDir = screenshotDir(target);
    fs.mkdirSync(outDir, { recursive: true });
    const browser = await chromium.launch();
    try {
        for (const view of VIEWS) {
            for (const viewport of VIEWPORTS) {
                await captureView(baseUrl, outDir, view, viewport, browser);
                process.stdout.write(`captured ${target}: ${view.name}-${viewport.name}\n`);
            }
        }
    } finally {
        await browser.close();
    }
}
