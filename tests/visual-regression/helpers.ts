import { Page, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(currentDir, 'fixtures');

function readFixture(name: string): string {
    return fs.readFileSync(path.join(fixturesDir, name), 'utf-8');
}

/**
 * Intercept all calls to the Hacker News API proxy and return frozen fixtures so
 * that both the Angular baseline and the React port render identical content.
 */
export async function mockApi(page: Page): Promise<void> {
    await page.route('**://node-hnapi.herokuapp.com/**', async (route) => {
        const url = new URL(route.request().url());
        const pathname = url.pathname; // e.g. /news, /item/123, /user/pg
        let body = '[]';

        if (pathname.startsWith('/item/')) {
            const id = pathname.split('/')[2];
            // The ask/text fixture exercises the `content` body; default link item otherwise.
            body = id === '48477135' ? readFixture('ask-item.json') : readFixture('item.json');
        } else if (pathname.startsWith('/user/')) {
            body = readFixture('user.json');
        } else {
            const feed = pathname.replace(/^\//, '').split('?')[0] || 'news';
            const file = `${feed}.json`;
            body = fs.existsSync(path.join(fixturesDir, file)) ? readFixture(file) : readFixture('news.json');
        }

        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            headers: { 'access-control-allow-origin': '*' },
            body,
        });
    });
}

export const THEMES = ['default', 'night', 'amoledblack'] as const;
export type Theme = (typeof THEMES)[number];

export const VIEWPORTS = {
    desktop: { width: 1280, height: 800 },
    mobile: { width: 375, height: 667 },
} as const;
export type ViewportName = keyof typeof VIEWPORTS;

export interface Scenario {
    name: string;
    path: string;
    /** A selector that must be visible before we screenshot. */
    ready: string;
    /** Optional action to run after navigation (e.g. open settings). */
    action?: (page: Page) => Promise<void>;
    /** Whether to capture the full scrollable page. Defaults to true. */
    fullPage?: boolean;
}

export const SCENARIOS: Scenario[] = [
    { name: 'news', path: '/news/1', ready: 'ol li.post' },
    { name: 'newest', path: '/newest/1', ready: 'ol li.post' },
    { name: 'show', path: '/show/1', ready: 'ol li.post' },
    { name: 'ask', path: '/ask/1', ready: 'ol li.post' },
    { name: 'jobs', path: '/jobs/1', ready: '.job-header' },
    { name: 'item', path: '/item/48475483', ready: '.comment-list' },
    { name: 'user', path: '/user/pg', ready: '.main-details' },
    {
        name: 'settings',
        path: '/news/1',
        // The cog is present on load; the popup only appears after the action clicks it.
        ready: 'img[alt="Settings"]',
        // The settings overlay is position:fixed and covers the viewport; a fullPage capture
        // over the (very tall) feed behind it never stabilizes, so capture the viewport only.
        fullPage: false,
        action: async (page: Page) => {
            await page.click('img[alt="Settings"]');
            await page.waitForSelector('.popup', { state: 'visible' });
        },
    },
];

/**
 * Seed localStorage so the app boots with a deterministic theme + fixed font/spacing,
 * independent of the prefers-color-scheme of the host machine.
 */
export async function seedTheme(page: Page, theme: Theme): Promise<void> {
    await page.addInitScript(
        ([t]) => {
            try {
                localStorage.setItem('theme', t);
                localStorage.setItem('titleFontSize', '16');
                localStorage.setItem('listSpacing', '0');
                localStorage.setItem('openLinkInNewTab', 'false');
            } catch {
                /* ignore */
            }
        },
        [theme]
    );
}

export function snapshotName(scenario: string, theme: Theme, viewport: ViewportName): string {
    return `${scenario}-${theme}-${viewport}.png`;
}

/**
 * Run the full matrix of scenarios x themes x viewports against the app served at baseURL.
 * The same snapshot names are used for the Angular baseline and the React port, so the
 * React run compares pixel-by-pixel against the Angular-generated baselines.
 */
export function runVisualMatrix(test: typeof import('@playwright/test').test): void {
    for (const [viewportName, viewport] of Object.entries(VIEWPORTS) as [ViewportName, typeof VIEWPORTS[ViewportName]][]) {
        for (const theme of THEMES) {
            for (const scenario of SCENARIOS) {
                test(`${scenario.name} - ${theme} - ${viewportName}`, async ({ page }) => {
                    await page.setViewportSize(viewport);
                    await mockApi(page);
                    await seedTheme(page, theme);
                    await page.goto(scenario.path, { waitUntil: 'networkidle' });
                    await page.waitForSelector(scenario.ready, { state: 'visible', timeout: 15000 });
                    if (scenario.action) {
                        await scenario.action(page);
                    }
                    // Settle any layout/fonts.
                    await page.waitForTimeout(300);
                    await expect(page).toHaveScreenshot(snapshotName(scenario.name, theme, viewportName), {
                        fullPage: scenario.fullPage !== false,
                        animations: 'disabled',
                        timeout: 25000,
                    });
                });
            }
        }
    }
}
