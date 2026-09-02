import { expect, test, type Page } from '@playwright/test';

const API = 'https://node-hnapi.herokuapp.com';
const FEEDS = ['news', 'newest', 'show', 'ask', 'jobs'] as const;

function story(id: number, feed: string) {
    return {
        id,
        title: `${feed} story ${id}`,
        points: id,
        user: 'pg',
        time: 0,
        time_ago: '1 hour ago',
        type: 'link',
        url: `https://example.com/${id}`,
        domain: 'example.com',
        comments_count: 3,
    };
}

const ITEM = {
    id: 101,
    title: 'news story 101',
    points: 101,
    user: 'pg',
    time: 0,
    time_ago: '1 hour ago',
    type: 'link',
    url: 'https://example.com/101',
    domain: 'example.com',
    comments_count: 3,
    comments: [
        {
            id: 201,
            level: 0,
            user: 'alice',
            time: 0,
            time_ago: '50 minutes ago',
            content: '<p>Top level comment</p>',
            comments: [
                {
                    id: 202,
                    level: 1,
                    user: 'bob',
                    time: 0,
                    time_ago: '40 minutes ago',
                    content: '<p>Nested reply</p>',
                    comments: [],
                },
            ],
        },
        { id: 203, level: 0, user: '', time: 0, time_ago: '', content: '', deleted: true, comments: [] },
    ],
};

const USER = { id: 'pg', karma: 1234, created: '18 years ago', about: '<b>Bug fixer.</b>' };

async function mockApi(page: Page) {
    await page.route(`${API}/**`, async (route) => {
        const url = new URL(route.request().url());
        const [, resource, id] = url.pathname.split('/');
        let body: unknown;
        if (resource === 'item') {
            body = ITEM;
        } else if (resource === 'user') {
            body = { ...USER, id };
        } else {
            const pageNum = Number(url.searchParams.get('page') ?? '1');
            const count = pageNum === 1 ? 30 : 5;
            body = Array.from({ length: count }, (_, i) => story(pageNum * 100 + i + 1, resource));
        }
        await route.fulfill({ json: body });
    });
}

test.beforeEach(async ({ page }) => {
    await mockApi(page);
});

test('redirects / to /news/1 and renders header, feed and footer', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/news\/1$/);
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('#footer')).toBeVisible();
    await expect(page.locator('ol > li')).toHaveCount(30);
    await expect(page.locator('ol > li').first()).toContainText('news story 101');
});

for (const feed of FEEDS) {
    test(`navigates to the ${feed} feed`, async ({ page }) => {
        await page.goto(`/${feed}/1`);
        await expect(page.locator('ol > li').first()).toContainText(`${feed} story 101`);
        if (feed === 'jobs') {
            await expect(page.locator('.job-header')).toContainText('funded by Y Combinator');
        } else {
            await expect(page.locator('.job-header')).toHaveCount(0);
        }
    });
}

test('header nav links switch feeds', async ({ page }) => {
    await page.goto('/news/1');
    await page.locator('header .header-nav a', { hasText: 'show' }).click();
    await expect(page).toHaveURL(/\/show\/1$/);
    await expect(page.locator('ol > li').first()).toContainText('show story 101');
    await page.locator('header .header-nav a', { hasText: 'ask' }).click();
    await expect(page).toHaveURL(/\/ask\/1$/);
    await page.locator('header .header-nav a', { hasText: 'jobs' }).click();
    await expect(page).toHaveURL(/\/jobs\/1$/);
    await page.locator('header .header-nav a', { hasText: 'new' }).first().click();
    await expect(page).toHaveURL(/\/newest\/1$/);
});

test('paginates with More and Prev', async ({ page }) => {
    await page.goto('/news/1');
    await expect(page.locator('.prev')).toHaveCount(0);
    await page.locator('.more').click();
    await expect(page).toHaveURL(/\/news\/2$/);
    await expect(page.locator('ol')).toHaveAttribute('start', '31');
    await expect(page.locator('ol > li')).toHaveCount(5);
    await expect(page.locator('.more')).toHaveCount(0);
    await page.locator('.prev').click();
    await expect(page).toHaveURL(/\/news\/1$/);
    await expect(page.locator('ol > li')).toHaveCount(30);
});

test('opens an item, collapses and expands comments, goes back', async ({ page }) => {
    await page.goto('/news/1');
    await page.locator('ol > li').first().getByRole('link', { name: '3 comments' }).first().click();
    await expect(page).toHaveURL(/\/item\/101$/);
    await expect(page.locator('.comment-list')).toContainText('Top level comment');
    await expect(page.locator('.comment-list')).toContainText('Nested reply');
    await expect(page.locator('.comment-list')).toContainText('Comment Deleted');

    const toggle = page.locator('.comment-list .meta .collapse', { hasText: '[-]' }).first();
    await toggle.click();
    await expect(page.getByText('Nested reply')).toBeHidden();
    await expect(page.locator('.comment-list .meta .collapse', { hasText: '[+]' }).first()).toBeVisible();
    await page.locator('.comment-list .meta .collapse', { hasText: '[+]' }).first().click();
    await expect(page.getByText('Nested reply')).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(/\/news\/1$/);
    await expect(page.locator('ol > li')).toHaveCount(30);
});

test('back button on mobile viewport returns to the feed', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 700 });
    await page.goto('/news/1');
    await page.locator('ol > li').first().getByRole('link', { name: '3 comments' }).first().click();
    await expect(page).toHaveURL(/\/item\/101$/);
    await page.locator('.back-button').first().click();
    await expect(page).toHaveURL(/\/news\/1$/);
});

test('visits a user profile', async ({ page }) => {
    await page.goto('/item/101');
    await page.locator('.comment-list a[href="/user/alice"]').first().click();
    await expect(page).toHaveURL(/\/user\/alice$/);
    await expect(page.locator('.profile .name')).toHaveText('alice');
    await expect(page.locator('.profile .right')).toContainText('1234');
    await expect(page.locator('.profile .age')).toContainText('Created 18 years ago');
    await expect(page.locator('.profile .other-details b')).toHaveText('Bug fixer.');
});

test('toggles settings and switches through all three themes', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/news/1');
    const root = page.locator('#root > div').first();
    await expect(root).toHaveClass('default');

    await page.locator('header img.settings').click();
    await expect(page.locator('#popup1')).toBeVisible();

    await page.locator('#popup1 input[type="radio"]').nth(1).check();
    await expect(root).toHaveClass('night');
    await page.locator('#popup1 input[type="radio"]').nth(2).check();
    await expect(root).toHaveClass('amoledblack');
    await page.locator('#popup1 input[type="radio"]').nth(0).check();
    await expect(root).toHaveClass('default');

    await page.locator('#popup1 input[type="checkbox"]').check();
    await expect(page.locator('ol > li a[target="_blank"]').first()).toBeVisible();

    await page.locator('#popup1 input[type="number"]').nth(0).fill('20');
    await expect(page.locator('ol > li').first().locator('[style*="font-size: 20px"]').first()).toBeVisible();

    await page.locator('#popup1 input[type="radio"]').nth(1).check();
    await page.locator('#popup1 .close').click();
    await expect(page.locator('#popup1')).toBeHidden();

    await page.reload();
    await expect(page.locator('#root > div').first()).toHaveClass('night');
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('night');
    expect(await page.evaluate(() => localStorage.getItem('openLinkInNewTab'))).toBe('true');
    expect(await page.evaluate(() => localStorage.getItem('titleFontSize'))).toBe('20');
});

test('follows prefers-color-scheme when no theme is saved', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/news/1');
    await expect(page.locator('#root > div').first()).toHaveClass('night');
});
