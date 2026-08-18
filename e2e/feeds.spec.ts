import { expect, test } from '@playwright/test';
import { stubHackerNewsApi } from './fixtures/hnApi';

const feeds = ['news', 'newest', 'show', 'ask', 'jobs'] as const;

test.beforeEach(async ({ page }) => {
    await stubHackerNewsApi(page);
});

test('landing on / redirects to /news/1', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL('/news/1');
    await expect(page.locator('li.post')).toHaveCount(30);
    await expect(page.locator('ol')).toHaveAttribute('start', '1');
});

for (const feed of feeds) {
    test(`browsing the ${feed} feed and paginating`, async ({ page }) => {
        await page.goto(`/${feed}/1`);

        await expect(page.locator('li.post')).toHaveCount(30);
        await expect(page.locator('li.post').first()).toContainText(`${feed} story 1`);
        await expect(page.locator('a.prev')).toHaveCount(0);

        await page.getByRole('link', { name: 'More ›' }).click();

        await expect(page).toHaveURL(`/${feed}/2`);
        await expect(page.locator('ol')).toHaveAttribute('start', '31');
        await expect(page.locator('li.post').first()).toContainText(`${feed} story 31`);

        await page.getByRole('link', { name: '‹ Prev' }).click();

        await expect(page).toHaveURL(`/${feed}/1`);
        await expect(page.locator('ol')).toHaveAttribute('start', '1');
    });
}

test('the header navigates between feeds', async ({ page }) => {
    await page.goto('/news/1');

    await page.getByRole('link', { name: 'show', exact: true }).click();
    await expect(page).toHaveURL('/show/1');
    await expect(page.locator('li.post').first()).toContainText('show story 1');

    await page.getByRole('link', { name: 'jobs', exact: true }).click();
    await expect(page).toHaveURL('/jobs/1');
    await expect(page.locator('p.job-header')).toBeVisible();
});
