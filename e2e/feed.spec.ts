import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

function story(id: number) {
    return {
        id,
        title: `Stubbed story ${id}`,
        points: id,
        user: 'pg',
        time: 0,
        time_ago: '1 hour ago',
        type: 'link',
        url: `https://example.com/${id}`,
        domain: 'example.com',
        comments: [],
        comments_count: id,
    };
}

async function stubFeed(page: Page, count: number) {
    await page.route('**/node-hnapi.herokuapp.com/**', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(Array.from({ length: count }, (_, i) => story(i + 1))),
        });
    });
}

test('renders the news feed with numbered stories', async ({ page }) => {
    await stubFeed(page, 30);
    await page.goto('/news/1');

    await expect(page.locator('ol')).toHaveAttribute('start', '1');
    await expect(page.locator('li.post')).toHaveCount(30);
    await expect(page.locator('li.post').first().locator('.title')).toHaveText('Stubbed story 1');
    await expect(page.locator('li.post').first().locator('.domain')).toHaveText('(example.com)');
    await expect(page.locator('.nav .prev')).toHaveCount(0);
});

test('navigates to the next page with the More link', async ({ page }) => {
    await stubFeed(page, 30);
    await page.goto('/news/1');

    await page.locator('.nav .more').click();
    await expect(page).toHaveURL(/\/news\/2$/);
    await expect(page.locator('ol')).toHaveAttribute('start', '31');
    await expect(page.locator('.nav .prev')).toHaveText('‹ Prev');
});

test('shows the job header on the jobs feed', async ({ page }) => {
    await stubFeed(page, 5);
    await page.goto('/jobs/1');

    await expect(page.locator('.job-header')).toContainText('Y Combinator');
    await expect(page.locator('ol')).not.toHaveClass(/list-margin/);
});

test('shows an error message when the feed request fails', async ({ page }) => {
    await page.route('**/node-hnapi.herokuapp.com/**', (route) => route.fulfill({ status: 500, body: 'nope' }));
    await page.goto('/news/1');

    await expect(page.locator('.error-section')).toContainText('Could not load news stories.');
});
