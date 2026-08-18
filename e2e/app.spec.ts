import { expect, test, Page } from '@playwright/test';

const story = {
    id: 1,
    title: 'A React story',
    points: 42,
    user: 'devin',
    time: 1600000000,
    time_ago: '2 hours ago',
    type: 'story',
    url: 'https://example.com/react',
    domain: 'example.com',
    comments: [],
    comments_count: 1,
};

async function mockApi(page: Page) {
    await page.route('**/node-hnapi.herokuapp.com/**', (route) => {
        const url = route.request().url();
        if (url.includes('/user/')) {
            return route.fulfill({
                json: { id: 'devin', created: '2 years ago', karma: 1234, about: 'Hello' },
            });
        }
        if (url.includes('/item/')) {
            return route.fulfill({
                json: {
                    ...story,
                    content: '<p>Body</p>',
                    comments: [
                        {
                            id: 10,
                            level: 0,
                            user: 'commenter',
                            time: 1600000000,
                            time_ago: '1 hour ago',
                            content: '<p>Nice</p>',
                            comments: [],
                        },
                    ],
                },
            });
        }
        return route.fulfill({ json: [story] });
    });
}

test.beforeEach(async ({ page }) => {
    await mockApi(page);
});

test('redirects to the news feed and renders stories', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/news\/1$/);
    await expect(page.getByRole('link', { name: 'A React story' })).toBeVisible();
});

test('navigates between feeds', async ({ page }) => {
    await page.goto('/news/1');
    await page.getByRole('link', { name: 'jobs' }).click();
    await expect(page).toHaveURL(/\/jobs\/1$/);
    await expect(page.getByText('These are jobs at startups')).toBeVisible();
});

test('opens item details with comments', async ({ page }) => {
    await page.goto('/item/1');
    await expect(page.getByText('Nice')).toBeVisible();
    await expect(page.getByRole('link', { name: '1 comment' })).toBeVisible();
});

test('opens a user profile', async ({ page }) => {
    await page.goto('/user/devin');
    await expect(page.getByText('1234 ★')).toBeVisible();
});

test('changes the theme from settings', async ({ page }) => {
    await page.goto('/news/1');
    await page.getByAltText('Settings').click();
    await page.getByLabel('Night').check();
    await expect(page.locator('div.night')).toBeVisible();
});

test('has no severe console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (message) => {
        if (message.type() === 'error') {
            errors.push(message.text());
        }
    });
    await page.goto('/news/1');
    await expect(page.getByRole('link', { name: 'A React story' })).toBeVisible();
    expect(errors).toEqual([]);
});
