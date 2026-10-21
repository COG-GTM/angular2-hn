import type { BrowserContext, Page } from '@playwright/test';

/**
 * Shared HN API fixtures and helpers for the e2e specs.
 *
 * Selectors are Angular class names kept by the React port (MIGRATION.md), never placeholder test ids:
 * - shell (this workstream): `#header`, `a.home-link`, `.header-nav a`, `img.settings`, `#popup1`, `.close`, `#footer`
 * - feature pages (other workstreams, specs marked `test.fixme` until they land): `.main-content`, `.post`,
 *   `.nav .more`, `.nav .prev`, `.item`, `.comment-list`, `.collapse`, `.profile`, `.main-details .name`
 */
export const HN_API = 'https://node-hnapi.herokuapp.com';
export const HNPWA_API = 'https://api.hnpwa.com/v0';

export const FEED_TYPES = ['news', 'newest', 'show', 'ask', 'jobs'] as const;

export const story = {
    id: 8863,
    title: 'My YC app: Dropbox - Throw away your USB drive',
    points: 104,
    user: 'dhouston',
    time: 1175714200,
    time_ago: '15 years ago',
    comments_count: 1,
    type: 'link',
    url: 'http://www.getdropbox.com/u/2/screencast.html',
    domain: 'getdropbox.com',
};

export const item = {
    ...story,
    content: '',
    comments: [
        {
            id: 9224,
            level: 0,
            user: 'brett',
            time: 1175727286,
            time_ago: '15 years ago',
            content: '<p>Fixture comment body</p>',
            comments: [
                {
                    id: 9225,
                    level: 1,
                    user: 'reply-user',
                    time: 1175727300,
                    time_ago: '15 years ago',
                    content: '<p>Fixture reply body</p>',
                    comments: [],
                },
            ],
        },
    ],
};

export const user = {
    id: 'pg',
    created_time: 1160418092,
    created: '17 years ago',
    karma: 155111,
    about: '<p>Fixture about text</p>',
};

/** Whatever the router outlet rendered between `#header` and `#footer` (placeholder or real page). */
export function outlet(page: Page) {
    return page.locator('#root .wrapper > header + :not(#footer)');
}

export const urls = {
    feed: (feed: string, page = 1) => `${HN_API}/${feed}?page=${page}`,
    item: (id: number) => `${HN_API}/item/${id}`,
    user: (id: string) => `${HNPWA_API}/user/${id}.json`,
};

const CORS = { 'access-control-allow-origin': '*' };

export interface MockOptions {
    /** Delay every API response (used to keep the first request in flight while the SW installs). */
    latencyMs?: number;
}

/** Mocks node-hnapi (feeds/items) and HNPWA (users) on a page or the whole context (SW requests too). */
export async function mockHnApi(target: Page | BrowserContext, { latencyMs = 0 }: MockOptions = {}) {
    const delay = () => (latencyMs ? new Promise((resolve) => setTimeout(resolve, latencyMs)) : undefined);
    await target.route(`${HN_API}/**`, async (route) => {
        await delay();
        const { pathname } = new URL(route.request().url());
        const match = /^\/item\/(\d+)$/.exec(pathname);
        if (match) {
            const body = Number(match[1]) === item.id ? item : { error: `Item ${match[1]} not found` };
            return route.fulfill({ json: body, headers: CORS });
        }
        return route.fulfill({
            json: Array.from({ length: 30 }, (_, i) => ({ ...story, id: story.id + i })),
            headers: CORS,
        });
    });
    await target.route(`${HNPWA_API}/**`, async (route) => {
        await delay();
        const known = new URL(route.request().url()).pathname === `/v0/user/${user.id}.json`;
        return route.fulfill({ json: known ? user : null, headers: CORS });
    });
}

/**
 * Port of the protractor afterEach (no SEVERE browser log entries). With `serviceWorkers: 'block'`
 * registerSW logs "Service worker registration failed" on every page; that one is expected.
 */
export function collectConsoleErrors(page: Page): string[] {
    const errors: string[] = [];
    page.on('console', (message) => {
        if (message.type() !== 'error') return;
        const text = message.text();
        if (text.startsWith('Service worker registration failed')) return;
        errors.push(text);
    });
    page.on('pageerror', (error) => errors.push(error.message));
    return errors;
}
