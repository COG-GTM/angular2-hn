import { expect, test } from './fixtures';

test('redirects the root url to /news/1', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL('/news/1');
    await expect(page.locator('.post').first()).toContainText('news story 1');
});

test('navigates between all feed types', async ({ page }) => {
    await page.goto('/news/1');

    for (const [link, feedType] of [
        ['new', 'newest'],
        ['show', 'show'],
        ['ask', 'ask'],
        ['jobs', 'jobs'],
    ]) {
        await page.getByRole('link', { name: link, exact: true }).click();
        await expect(page).toHaveURL(`/${feedType}/1`);
        await expect(page.locator('.post').first()).toContainText(`${feedType} story 1`);
    }
});

test('paginates to the next page', async ({ page }) => {
    await page.goto('/news/1');

    await expect(page.locator('.prev')).toHaveCount(0);
    await page.goto('/news/2');
    await expect(page.locator('.prev')).toBeVisible();
    await page.locator('.prev').click();
    await expect(page).toHaveURL('/news/1');
});

test('opens an item, shows its comments and collapses one', async ({ page }) => {
    await page.goto('/item/1');

    await expect(page.locator('.laptop .title')).toHaveText('Story 1');
    await expect(page.getByText('Top level comment')).toBeVisible();
    await expect(page.getByText('Nested reply')).toBeVisible();

    await page.locator('.comment .collapse').first().click();

    await expect(page.getByText('Top level comment')).toBeHidden();
    await expect(page.locator('.comment .collapse').first()).toHaveText('[+]');
});

test('visits a user page', async ({ page }) => {
    await page.goto('/user/user1');

    await expect(page.locator('.main-details .name')).toHaveText('user1');
    await expect(page.locator('.main-details .right')).toContainText('4321');
    await expect(page.locator('.other-details')).toContainText('About the user');
});

test('toggles the settings panel and switches themes', async ({ page }) => {
    await page.goto('/news/1');

    await expect(page.locator('.popup')).toHaveCount(0);
    await page.locator('img.settings').click();
    await expect(page.locator('.popup')).toBeVisible();

    await page.getByLabel('Night').check();
    await expect(page.locator('div.night')).toBeVisible();

    await page.getByLabel('Black (AMOLED)').check();
    await expect(page.locator('div.amoledblack')).toBeVisible();

    await page.locator('.popup .close').click();
    await expect(page.locator('.popup')).toHaveCount(0);

    await page.reload();
    await expect(page.locator('div.amoledblack')).toBeVisible();
});

test('shows an error when the feed request fails', async ({ page }) => {
    await page.route('https://node-hnapi.herokuapp.com/**', (route) => route.abort());
    await page.goto('/news/1');

    await expect(page.getByText('Could not load news stories.')).toBeVisible();
});
