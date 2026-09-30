import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Page } from '@playwright/test';

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), 'fixtures');

export interface FixtureMeta {
    itemId: number;
    askItemId: number;
    userId: string;
}

export const meta: FixtureMeta = JSON.parse(readFileSync(join(fixturesDir, 'meta.json'), 'utf8'));
const responses: Record<string, unknown> = JSON.parse(readFileSync(join(fixturesDir, 'api.json'), 'utf8'));

export async function useFixtures(page: Page): Promise<void> {
    await page.route('https://node-hnapi.herokuapp.com/**', (route) => {
        const url = new URL(route.request().url());
        const body = responses[url.pathname + url.search];
        if (body === undefined) {
            return route.fulfill({
                status: 404,
                contentType: 'text/html',
                headers: { 'access-control-allow-origin': '*' },
                body: `<pre>Cannot GET ${url.pathname}</pre>`,
            });
        }
        return route.fulfill({
            status: 200,
            contentType: 'application/json',
            headers: { 'access-control-allow-origin': '*' },
            body: JSON.stringify(body),
        });
    });
    // Keeps the React app's user fallback (official HN API) offline and deterministic.
    await page.route('https://hacker-news.firebaseio.com/**', (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: 'null' })
    );
    await page.route('https://www.google-analytics.com/**', (route) => route.abort());
}

export async function setTheme(page: Page, theme: string): Promise<void> {
    await page.addInitScript((t) => localStorage.setItem('theme', t), theme);
}
