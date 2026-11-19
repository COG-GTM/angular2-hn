import { test as base, expect, type BrowserContext, type Route } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// By default every Hacker News API call is answered from fixtures/ (recorded from the live API),
// so both apps render identical data and the specs can assert exact text.
// PARITY_LIVE=1 hits the live API instead.
export const live = !!process.env.PARITY_LIVE;
const fixturesDir = join(__dirname, 'fixtures');

export function fixture<T = any>(name: string): T {
    return JSON.parse(readFileSync(join(fixturesDir, `${name}.json`), 'utf8'));
}

const cors = { 'access-control-allow-origin': '*' };

// node-hnapi: /news?page=1, /item/1, /user/pg.  HNPWA: /v0/news/1.json, /v0/item/1.json, /v0/user/pg.json
function fixtureNameFor(url: URL): string | undefined {
    const parts = url.pathname
        .replace(/^\/v0/, '')
        .replace(/\.json$/, '')
        .split('/')
        .filter(Boolean);
    if (parts.length === 1) return `${parts[0]}-${url.searchParams.get('page') ?? 1}`;
    if (parts.length === 2) return `${parts[0]}-${parts[1]}`;
    return undefined;
}

async function answerFromFixtures(route: Route): Promise<void> {
    const name = fixtureNameFor(new URL(route.request().url()));
    const file = name && join(fixturesDir, `${name}.json`);
    if (file && existsSync(file)) {
        await route.fulfill({
            status: 200,
            headers: cors,
            contentType: 'application/json',
            body: readFileSync(file, 'utf8'),
        });
    } else {
        await route.fulfill({
            status: 404,
            headers: cors,
            contentType: 'application/json',
            body: '{"error":"no fixture"}',
        });
    }
}

// node-hnapi dropped /user/:id; the legacy app still calls it, so live runs send it to HNPWA (same shape).
async function legacyUserToHnpwa(route: Route): Promise<void> {
    const id = new URL(route.request().url()).pathname.split('/').pop();
    const response = await route.fetch({ url: `https://api.hnpwa.com/v0/user/${id}.json` });
    await route.fulfill({ response, headers: { ...response.headers(), ...cors } });
}

export async function routeHackerNewsApi(context: BrowserContext): Promise<void> {
    if (live) {
        await context.route('https://node-hnapi.herokuapp.com/user/**', legacyUserToHnpwa);
        return;
    }
    await context.route('https://node-hnapi.herokuapp.com/**', answerFromFixtures);
    await context.route('https://api.hnpwa.com/**', answerFromFixtures);
}

export const test = base.extend<{ hnApi: void }>({
    hnApi: [
        async ({ context }, use) => {
            await routeHackerNewsApi(context);
            await use();
        },
        { auto: true },
    ],
});

test.afterEach(async ({ page }, testInfo) => {
    const name = testInfo.titlePath
        .slice(1)
        .join(' - ')
        .replace(/[^\w-]+/g, '_');
    await page
        .screenshot({
            path: join(__dirname, 'report', 'screenshots', testInfo.project.name, `${name}.png`),
            fullPage: true,
        })
        .catch(() => undefined);
});

export { expect };
