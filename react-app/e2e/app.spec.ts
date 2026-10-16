/// <reference lib="dom" />
import { expect, test, type Page } from '@playwright/test';

const story = (id: number, extra: Record<string, unknown> = {}) => ({
    id,
    title: `Story ${id}`,
    points: 10 + id,
    user: 'pg',
    time: 1700000000,
    time_ago: '2 hours ago',
    type: 'link',
    url: `https://example.com/${id}`,
    domain: 'example.com',
    comments_count: 2,
    ...extra,
});

async function mockApi(page: Page) {
    await page.route('https://node-hnapi.herokuapp.com/**', async (route) => {
        const url = new URL(route.request().url());
        const [, kind, id] = url.pathname.split('/');
        if (kind === 'item') {
            return route.fulfill({
                json: story(Number(id), {
                    content: '<p>Body <script>window.__xss = 1</script></p>',
                    comments: [
                        {
                            id: 1,
                            level: 0,
                            user: 'alice',
                            time: 1,
                            time_ago: '1 hour ago',
                            content: '<p>Top comment</p>',
                            comments: [
                                {
                                    id: 2,
                                    level: 1,
                                    user: 'bob',
                                    time: 2,
                                    time_ago: '30 minutes ago',
                                    content: '<p>Nested reply</p>',
                                    comments: [],
                                },
                            ],
                        },
                    ],
                }),
            });
        }
        const page = Number(url.searchParams.get('page') ?? 1);
        const count = page === 1 ? 30 : 5;
        return route.fulfill({
            json: Array.from({ length: count }, (_, i) =>
                story((page - 1) * 30 + i + 1, { title: `${kind} ${page}-${i + 1}` })
            ),
        });
    });
    await page.route('https://api.hnpwa.com/v0/user/**', (route) =>
        route.request().url().endsWith('/pg.json')
            ? route.fulfill({ json: { id: 'pg', karma: 155000, created: '19 years ago', about: '<p>Bug fixer.</p>' } })
            : route.fulfill({ status: 200, contentType: 'application/json', body: 'null' })
    );
}

const consoleErrors: string[] = [];

test.beforeEach(async ({ page }) => {
    consoleErrors.length = 0;
    page.on('console', (msg) => {
        // playwright.config.ts blocks service workers here, so registration always fails; offline.spec.ts covers the SW.
        if (msg.type() === 'error' && !msg.text().startsWith('Service worker registration failed')) {
            consoleErrors.push(msg.text());
        }
    });
    page.on('pageerror', (err) => consoleErrors.push(err.message));
    await mockApi(page);
});

test.afterEach(() => {
    // Ported from the Protractor spec: no severe browser errors.
    expect(consoleErrors).toEqual([]);
});

test('redirects / to /news/1 and renders 30 stories', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/news\/1$/);
    await expect(page.locator('li.post')).toHaveCount(30);
});

for (const feed of ['newest', 'show', 'ask', 'jobs']) {
    test(`header nav opens the ${feed} feed`, async ({ page }) => {
        await page.goto('/news/1');
        const label = feed === 'newest' ? 'new' : feed;
        await page.locator('.header-nav a', { hasText: new RegExp(`^${label}$`) }).click();
        await expect(page).toHaveURL(new RegExp(`/${feed}/1$`));
        await expect(page.locator('li.post').first()).toContainText(`${feed} 1-1`);
    });
}

test('pagination: More goes to page 2 and numbering continues at 31', async ({ page }) => {
    await page.goto('/news/1');
    await page.locator('.nav a.more').click();
    await expect(page).toHaveURL(/\/news\/2$/);
    await expect(page.locator('ol')).toHaveAttribute('start', '31');
    await expect(page.locator('.nav a.more')).toHaveCount(0);
    await page.locator('.nav a.prev').click();
    await expect(page).toHaveURL(/\/news\/1$/);
});

test('item page renders sanitized content and nested comments', async ({ page }) => {
    await page.goto('/item/42');
    await expect(page.locator('.item .title').first()).toContainText('Story 42');
    await expect(page.getByText('Top comment')).toBeVisible();
    await expect(page.getByText('Nested reply')).toBeVisible();
    expect(await page.evaluate(() => (window as unknown as { __xss?: number }).__xss)).toBeUndefined();
});

test('user page renders a profile and an error for unknown users', async ({ page }) => {
    await page.goto('/user/pg');
    await expect(page.locator('.profile .name')).toHaveText('pg');
    await expect(page.getByText('Bug fixer.')).toBeVisible();
    await page.goto('/user/nobody-xyz');
    await expect(page.locator('.profile')).toHaveCount(0);
});

test('settings: theme choice applies and persists across reloads', async ({ page }) => {
    await page.goto('/news/1');
    await page.locator('img.settings').click();
    await page.locator('#popup1').getByText(/night/i).first().click();
    await expect(page.locator('.night')).toHaveCount(1);
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('night');
    await page.reload();
    await expect(page.locator('.night')).toHaveCount(1);
});
