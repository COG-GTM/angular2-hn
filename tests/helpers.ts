import { promises as fs } from 'fs';
import * as path from 'path';
import { Page, TestInfo, expect } from '@playwright/test';
import {
    feedFixture,
    jobsFixture,
    storyFixture,
    pollFixture,
    pollOptionFixture,
    userFixture,
    STORY_ID,
    POLL_ID,
    INVALID_ID,
} from './fixtures';

export type AppName = 'angular' | 'react';
export type ThemeName = 'default' | 'night' | 'amoledblack';
export type ViewportName = 'desktop' | 'mobile';

export const VIEWPORTS: Record<ViewportName, { width: number; height: number }> = {
    desktop: { width: 1280, height: 720 },
    mobile: { width: 375, height: 812 }, // iPhone X
};

export const THEMES: ThemeName[] = ['default', 'night', 'amoledblack'];

// Resolved against the project root (Playwright + the compare script both run
// from there). Avoids __dirname, which is undefined under "type": "module".
export const SCREENSHOTS_DIR = path.join(process.cwd(), 'screenshots');

/** Known fixture ids re-exported for spec readability. */
export { STORY_ID, POLL_ID, INVALID_ID };
export const USER_ID = 'parityuser';

/** The Playwright project name encodes which app is under test. */
export function appName(testInfo: TestInfo): AppName {
    return testInfo.project.name as AppName;
}

/**
 * Intercept every Hacker News API call (made by either app) and serve
 * deterministic fixtures so Angular and React render identical content.
 */
export async function mockApi(page: Page): Promise<void> {
    await page.route('**/node-hnapi.herokuapp.com/**', async (route) => {
        const url = new URL(route.request().url());
        const pathname = url.pathname;

        // Simulate an upstream failure for the invalid id to exercise error UI.
        if (pathname === `/item/${INVALID_ID}`) {
            await route.abort();
            return;
        }

        let body: unknown = null;
        const itemMatch = pathname.match(/^\/item\/(\d+)$/);
        const userMatch = pathname.match(/^\/user\/(.+)$/);
        const feedMatch = pathname.match(/^\/(news|newest|show|ask|jobs)$/);

        if (feedMatch) {
            body = feedMatch[1] === 'jobs' ? jobsFixture() : feedFixture();
        } else if (itemMatch) {
            const id = Number(itemMatch[1]);
            if (id === POLL_ID) body = pollFixture();
            else if (id > POLL_ID && id <= POLL_ID + 3) body = pollOptionFixture(id - POLL_ID);
            else body = storyFixture();
        } else if (userMatch) {
            body = userFixture();
        }

        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(body),
        });
    });
}

/** Disable animations/transitions so screenshots are stable. */
export async function stabilize(page: Page): Promise<void> {
    await page.addStyleTag({
        content: `*, *::before, *::after {
            animation-duration: 0s !important;
            animation-delay: 0s !important;
            transition-duration: 0s !important;
            transition-delay: 0s !important;
            caret-color: transparent !important;
        }`,
    });
    await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => undefined);
}

/** Navigate to a route and wait for the loader to disappear. */
export async function gotoAndWait(page: Page, route: string): Promise<void> {
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    await page
        .locator('.loading-section')
        .first()
        .waitFor({ state: 'detached', timeout: 15000 })
        .catch(() => undefined);
    await stabilize(page);
}

/** Open the settings popup (idempotent). */
export async function openSettings(page: Page): Promise<void> {
    if (await page.locator('#popup1').count()) return;
    await page.locator('img.settings').click();
    await page.locator('#popup1').waitFor({ state: 'visible' });
}

export async function closeSettings(page: Page): Promise<void> {
    if (!(await page.locator('#popup1').count())) return;
    await page.locator('#popup1 .close').click();
    await page.locator('#popup1').waitFor({ state: 'detached' }).catch(() => undefined);
}

/** Switch the active theme through the settings popup, like a real user. */
export async function setTheme(page: Page, theme: ThemeName): Promise<void> {
    await openSettings(page);
    await page.locator(`#popup1 input[name="theme"][value="${theme}"]`).check();
    await closeSettings(page);
    await stabilize(page);
}

/** The class on the top-level wrapper reflects the active theme. */
export async function getThemeClass(page: Page): Promise<string> {
    return page.evaluate(() => {
        const cover = document.querySelector('.body-cover');
        return cover && cover.parentElement ? cover.parentElement.className.trim() : '';
    });
}

/** Build a screenshot filename encoding page, theme and viewport. */
export function screenshotName(pageKey: string, theme: ThemeName, viewport: ViewportName): string {
    return `${pageKey}__${theme}__${viewport}.png`;
}

/** Capture a stable full-page screenshot into screenshots/<app>/. */
export async function capture(
    page: Page,
    testInfo: TestInfo,
    pageKey: string,
    theme: ThemeName,
    viewport: ViewportName,
): Promise<void> {
    const dir = path.join(SCREENSHOTS_DIR, appName(testInfo));
    await fs.mkdir(dir, { recursive: true });
    const file = path.join(dir, screenshotName(pageKey, theme, viewport));
    await page.screenshot({ path: file, fullPage: true, animations: 'disabled' });
    await testInfo.attach(screenshotName(pageKey, theme, viewport), {
        path: file,
        contentType: 'image/png',
    });
}

/** Set a numeric settings input in a way that fires both apps' handlers. */
export async function setNumberSetting(page: Page, type: 'font' | 'spacing', value: string): Promise<void> {
    await openSettings(page);
    const inputs = page.locator('#popup1 input[type="number"]');
    const input = type === 'font' ? inputs.nth(0) : inputs.nth(1);
    await input.click();
    await input.fill('');
    // pressSequentially dispatches keydown/keyup (Angular listens on keyup) as
    // well as input/change (React listens on change).
    await input.pressSequentially(value);
    await input.blur();
}

export async function setOpenLinksInNewTab(page: Page, enabled: boolean): Promise<void> {
    await openSettings(page);
    const checkbox = page.locator('#popup1 input[type="checkbox"]').first();
    if (enabled) await checkbox.check();
    else await checkbox.uncheck();
}

/** Assert helper shared by parity specs to keep messages descriptive. */
export async function expectVisible(page: Page, selector: string): Promise<void> {
    await expect(page.locator(selector).first()).toBeVisible();
}
