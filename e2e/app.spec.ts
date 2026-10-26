import { expect, test, type Page } from '@playwright/test';

const story = (id: number, overrides: Record<string, unknown> = {}) => ({
    id,
    title: `Story ${id}`,
    points: 10,
    user: 'pg',
    time_ago: '1 hour ago',
    type: 'story',
    url: `https://example.com/${id}`,
    domain: 'example.com',
    comments_count: 2,
    ...overrides,
});

async function mockApi(page: Page) {
    await page.route(/node-hnapi\.herokuapp\.com|api\.hnpwa\.com/, (route) => {
        const url = new URL(route.request().url());
        if (url.pathname.startsWith('/item/')) {
            return route.fulfill({
                json: story(1, {
                    title: 'Ask HN: Item details',
                    url: 'item?id=1',
                    content: '<p>Self post body</p>',
                    comments: [
                        { id: 2, user: 'dang', time_ago: 'now', content: '<p>Top comment</p>', comments: [] },
                    ],
                }),
            });
        }
        if (url.pathname.includes('/user/')) {
            return url.hostname === 'api.hnpwa.com'
                ? route.fulfill({ json: { id: 'pg', karma: 157316, created: '20 years ago', about: 'Bug fixer.' } })
                : route.fulfill({ status: 404, body: '' });
        }
        const pageNum = Number(url.searchParams.get('page'));
        return route.fulfill({ json: Array.from({ length: 30 }, (_, i) => story(pageNum * 100 + i)) });
    });
}

test.beforeEach(async ({ page }) => {
    await mockApi(page);
});

test('redirects to the news feed and paginates without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));

    await page.goto('/');
    await expect(page).toHaveURL(/\/news\/1$/);
    await expect(page.getByRole('link', { name: 'Story 100' })).toBeVisible();

    await page.getByRole('link', { name: 'More ›' }).click();
    await expect(page).toHaveURL(/\/news\/2$/);
    await expect(page.getByRole('link', { name: 'Story 200' })).toBeVisible();
    expect(errors).toEqual([]);
});

test('navigates between feeds from the header', async ({ page }) => {
    await page.goto('/news/1');
    for (const [label, path] of [
        ['new', 'newest'],
        ['show', 'show'],
        ['ask', 'ask'],
        ['jobs', 'jobs'],
    ]) {
        await page.locator('.header-nav').getByRole('link', { name: label, exact: true }).click();
        await expect(page).toHaveURL(new RegExp(`/${path}/1$`));
    }
    await expect(page.getByText('These are jobs at startups')).toBeVisible();
});

test('shows item details with comments', async ({ page }) => {
    await page.goto('/item/1');
    await expect(page.getByText('Self post body')).toBeVisible();
    await expect(page.getByText('Top comment')).toBeVisible();
});

test('shows a user profile', async ({ page }) => {
    await page.goto('/user/pg');
    await expect(page.locator('.main-details .name')).toHaveText('pg');
    await expect(page.getByText('157316 ★')).toBeVisible();
});

test('persists the selected theme across reloads', async ({ page }) => {
    await page.goto('/news/1');
    await page.getByAltText('Settings').click();
    await page.getByLabel('Black (AMOLED)').check();
    await page.reload();
    await expect(page.locator('#root > div')).toHaveClass('amoledblack');
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('amoledblack');
});
