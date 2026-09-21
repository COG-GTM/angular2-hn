import { expect, test } from './fixtures';

test('redirects the root path to the news feed', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL('/news/1');
    await expect(page.locator('ol > li').first()).toContainText('news story 1 page 1');
});

for (const [link, feedType] of [
    ['new', 'newest'],
    ['show', 'show'],
    ['ask', 'ask'],
    ['jobs', 'jobs'],
] as const) {
    test(`navigates to the ${feedType} feed`, async ({ page }) => {
        await page.goto('/news/1');
        await page.getByRole('link', { name: link, exact: true }).click();

        await expect(page).toHaveURL(`/${feedType}/1`);
        await expect(page.locator('ol > li').first()).toContainText(`${feedType} story 1 page 1`);
    });
}

test('paginates forwards and backwards', async ({ page }) => {
    await page.goto('/news/1');
    await expect(page.locator('ol')).toHaveAttribute('start', '1');

    await page.getByRole('link', { name: 'More ›' }).click();

    await expect(page).toHaveURL('/news/2');
    await expect(page.locator('ol')).toHaveAttribute('start', '31');
    await expect(page.locator('ol > li').first()).toContainText('news story 1 page 2');

    await page.getByRole('link', { name: '‹ Prev' }).click();

    await expect(page).toHaveURL('/news/1');
    await expect(page.locator('ol')).toHaveAttribute('start', '1');
});

test('opens an item, toggles its comments, then goes back', async ({ page }) => {
    await page.goto('/news/1');
    await page.locator('ol > li').first().getByRole('link', { name: '3 comments' }).click();

    await expect(page).toHaveURL(/\/item\/\d+/);
    await expect(page.getByText('Item body text.')).toBeVisible();
    await expect(page.getByText('Top level comment.')).toBeVisible();
    await expect(page.getByText('Nested reply.')).toBeVisible();

    const collapse = page.locator('.comment .collapse').first();
    await expect(collapse).toHaveText('[-]');

    await collapse.click();
    await expect(collapse).toHaveText('[+]');
    await expect(page.getByText('Top level comment.')).toBeHidden();
    await expect(page.getByText('Nested reply.')).toBeHidden();

    await collapse.click();
    await expect(collapse).toHaveText('[-]');
    await expect(page.getByText('Nested reply.')).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL('/news/1');
});

test.describe('mobile', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('opens a user profile and navigates back with the back button', async ({ page }) => {
        await page.goto('/item/1000');
        await page.locator('.comment').first().getByRole('link', { name: 'commenter' }).click();

        await expect(page).toHaveURL('/user/commenter');
        await expect(page.getByText('Profile: commenter')).toBeVisible();
        await expect(page.getByText('4321 ★')).toBeVisible();
        await expect(page.getByText('About the commenter.')).toBeVisible();

        await page.locator('.back-button').click();
        await expect(page).toHaveURL('/item/1000');
    });
});
