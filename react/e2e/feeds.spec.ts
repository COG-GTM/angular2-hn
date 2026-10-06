import { expect, test, type Page } from '@playwright/test';
import { FEED_TYPES, PAGE_SIZES, feedHandlers, feedStoryId, feedStoryTitle } from './fixtures/feeds';
import { mockHnApi } from './support/mock-api';

const posts = (page: Page) => page.locator('ol > li.post');

test.describe('feeds', () => {
    for (const feedType of FEED_TYPES) {
        test(`${feedType}: renders the list and paginates /${feedType}/1 → 2 → 1`, async ({ page }) => {
            await mockHnApi(page, feedHandlers);
            await page.goto(`/${feedType}/1`);

            const feed = page.getByTestId('feed');
            await expect(feed).toHaveAttribute('data-feed-type', feedType);
            await expect(posts(page)).toHaveCount(PAGE_SIZES[1]);
            await expect(page.locator('ol')).toHaveAttribute('start', '1');
            await expect(posts(page).first().locator('a.title')).toHaveText(feedStoryTitle(feedType, 1, 0));
            await expect(page.locator('.job-header')).toHaveCount(feedType === 'jobs' ? 1 : 0);
            await expect(page.getByRole('link', { name: '‹ Prev' })).toHaveCount(0);

            await page.getByRole('link', { name: 'More ›' }).click();
            await expect(page).toHaveURL(new RegExp(`/${feedType}/2$`));
            await expect(feed).toHaveAttribute('data-page', '2');
            await expect(posts(page)).toHaveCount(PAGE_SIZES[2]);
            await expect(page.locator('ol')).toHaveAttribute('start', '31');
            await expect(posts(page).first().locator('a.title')).toHaveText(feedStoryTitle(feedType, 2, 0));
            await expect(page.getByRole('link', { name: 'More ›' })).toHaveCount(0);

            await page.getByRole('link', { name: '‹ Prev' }).click();
            await expect(page).toHaveURL(new RegExp(`/${feedType}/1$`));
            await expect(posts(page)).toHaveCount(PAGE_SIZES[1]);
            await expect(posts(page).first().locator('a.title')).toHaveText(feedStoryTitle(feedType, 1, 0));
            await expect(page.getByRole('link', { name: '‹ Prev' })).toHaveCount(0);
        });

        test(`${feedType}: shows the error state when the API fails`, async ({ page }) => {
            await mockHnApi(page, {});
            await page.goto(`/${feedType}/1`);

            await expect(page.getByRole('alert')).toContainText(`Could not load ${feedType} stories.`);
            await expect(page.getByTestId('feed')).toHaveAttribute('data-feed-type', feedType);
            await expect(posts(page)).toHaveCount(0);
        });
    }

    test('jobs rows hide user, points and comments', async ({ page }) => {
        await mockHnApi(page, feedHandlers);
        await page.goto('/jobs/1');

        const first = posts(page).first();
        await expect(first.locator('.subtext-laptop')).toHaveText('1 hours ago');
        await expect(first.locator('.subtext-laptop a')).toHaveCount(0);
        await expect(page.locator('.job-header').getByRole('link', { name: 'Triplebyte' })).toBeVisible();
    });

    test('clicking a comments link navigates to the item page', async ({ page }) => {
        await mockHnApi(page, feedHandlers);
        await page.goto('/news/1');

        const id = feedStoryId('news', 1, 2);
        const second = posts(page).nth(2);
        await expect(second.locator('.subtext-laptop')).toContainText('52 points by');
        await second.locator('.subtext-laptop').getByRole('link', { name: '2 comments' }).click();

        await expect(page).toHaveURL(new RegExp(`/item/${id}$`));
        await expect(page.getByTestId('item-details')).toHaveAttribute('data-item-id', String(id));
    });

    test('internal (ask) titles link to the item page', async ({ page }) => {
        await mockHnApi(page, feedHandlers);
        await page.goto('/ask/1');

        const id = feedStoryId('ask', 1, 0);
        await posts(page).first().locator('a.title').click();
        await expect(page).toHaveURL(new RegExp(`/item/${id}$`));
    });
});
