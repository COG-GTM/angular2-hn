import { expect, test } from '@playwright/test';
import { mockApi } from './mockApi';

test.beforeEach(async ({ page }) => {
    await mockApi(page);
});

test('redirects the root url to the news feed', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/news/1');
    await expect(page.locator('ol.list-margin li.post')).toHaveCount(30);
});

test('renders story rows with points, author and comment count', async ({ page }) => {
    await page.goto('/news/1');

    const firstPost = page.locator('li.post').first();
    await expect(firstPost.locator('a.title')).toHaveText('news story 1 (page 1)');
    await expect(firstPost.locator('.domain')).toHaveText('(example.com)');
    await expect(firstPost.locator('.subtext-laptop')).toContainText('101 points by author1');
    await expect(firstPost.locator('.subtext-laptop')).toContainText('1 comment');
});

for (const [label, path] of [
    ['new', '/newest/1'],
    ['show', '/show/1'],
    ['ask', '/ask/1'],
    ['jobs', '/jobs/1'],
] as const) {
    test(`navigates to the ${label} feed from the header`, async ({ page }) => {
        await page.goto('/news/1');
        await page.getByRole('link', { name: label, exact: true }).click();

        await expect(page).toHaveURL(path);
        await expect(page.locator('li.post').first()).toContainText(`${path.split('/')[1]} story 1`);
    });
}

test('shows the y combinator blurb only on the jobs feed', async ({ page }) => {
    await page.goto('/jobs/1');
    await expect(page.locator('.job-header')).toContainText('These are jobs at startups');

    await page.goto('/news/1');
    await expect(page.locator('.job-header')).toHaveCount(0);
});

test('paginates forwards and backwards', async ({ page }) => {
    await page.goto('/news/1');
    await expect(page.locator('.prev')).toHaveCount(0);

    await page.locator('.more').click();
    await expect(page).toHaveURL('/news/2');
    await expect(page.locator('ol')).toHaveAttribute('start', '31');
    await expect(page.locator('li.post').first()).toContainText('(page 2)');

    await page.locator('.prev').click();
    await expect(page).toHaveURL('/news/1');
    await expect(page.locator('ol')).toHaveAttribute('start', '1');
});

test('hides the more link on the last page', async ({ page }) => {
    await page.goto('/news/3');
    await expect(page.locator('li.post')).toHaveCount(12);
    await expect(page.locator('.more')).toHaveCount(0);
    await expect(page.locator('.prev')).toBeVisible();
});

test('shows the error view when the feed request fails', async ({ page }) => {
    await page.route('**/node-hnapi.herokuapp.com/news**', (route) => route.fulfill({ status: 500, body: '' }));
    await page.goto('/news/1');

    await expect(page.locator('.error-section')).toContainText('Could not load news stories.');
});
