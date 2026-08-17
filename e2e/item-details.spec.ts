import { expect, test } from '@playwright/test';

const item = {
    id: 100,
    title: 'Stubbed item details story',
    points: 123,
    user: 'devin',
    time: 1,
    time_ago: '3 hours ago',
    type: 'story',
    url: 'https://example.com/story',
    domain: 'example.com',
    content: '<p>Story body content</p>',
    comments_count: 2,
    comments: [
        {
            id: 200,
            level: 0,
            user: 'alice',
            time: 1,
            time_ago: '2 hours ago',
            content: '<p>Top level comment</p>',
            comments: [
                {
                    id: 201,
                    level: 1,
                    user: 'bob',
                    time: 1,
                    time_ago: '1 hour ago',
                    content: '<p>Nested reply</p>',
                    comments: [],
                },
            ],
        },
        {
            id: 202,
            level: 0,
            user: 'carol',
            time: 1,
            time_ago: '30 minutes ago',
            content: '',
            deleted: true,
            comments: [],
        },
    ],
};

test.beforeEach(async ({ page }) => {
    await page.route('**/node-hnapi.herokuapp.com/item/100', async (route) => {
        await route.fulfill({ json: item });
    });
});

test('renders the item details view with its comment tree', async ({ page }) => {
    await page.goto('/item/100');

    await expect(page.locator('.laptop .title')).toHaveText('Stubbed item details story');
    await expect(page.locator('.laptop .domain')).toHaveText('(example.com)');
    await expect(page.locator('.subtext').first()).toContainText('123 points by');
    await expect(page.locator('.subject')).toHaveText('Story body content');
    await expect(page.locator('.comment-list > li')).toHaveCount(2);
    await expect(page.locator('.comment-text').first()).toHaveText('Top level comment');
    await expect(page.locator('.subtree .comment-text')).toHaveText('Nested reply');
    await expect(page.locator('.deleted-meta')).toContainText('Comment Deleted');
});

test('collapses and expands a comment', async ({ page }) => {
    await page.goto('/item/100');

    const firstComment = page.locator('.comment-list > li').first();
    const body = firstComment.locator('.comment-tree > div').first();
    await expect(body).toBeVisible();

    await firstComment.locator('.collapse').first().click();
    await expect(body).toBeHidden();
    await expect(firstComment.locator('.meta').first()).toHaveClass(/meta-collapse/);
    await expect(firstComment.locator('.collapse').first()).toHaveText('[+]');

    await firstComment.locator('.collapse').first().click();
    await expect(body).toBeVisible();
});
