import { expect, test } from './fixtures';

test.use({ serviceWorkers: 'block' });

test('redirects / to /news/1', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/news\/1$/);
    await expect(page.getByText('news story 1-0')).toBeVisible();
    await expect(page.locator('ol > li')).toHaveCount(30);
});

for (const feed of ['news', 'newest', 'show', 'ask', 'jobs']) {
    test(`/${feed}/:page renders the ${feed} feed with pagination`, async ({ page }) => {
        await page.goto(`/${feed}/1`);
        await expect(page.getByText(`${feed} story 1-0`)).toBeVisible();
        await expect(page.getByText('‹ Prev')).toHaveCount(0);

        await page.getByText('More ›').click();
        await expect(page).toHaveURL(new RegExp(`/${feed}/2$`));
        await expect(page.getByText(`${feed} story 2-0`)).toBeVisible();
        await expect(page.locator('ol')).toHaveAttribute('start', '31');

        await page.getByText('‹ Prev').click();
        await expect(page).toHaveURL(new RegExp(`/${feed}/1$`));
    });
}

test('header nav links switch feeds', async ({ page }) => {
    await page.goto('/news/1');
    for (const [label, feed] of [
        ['new', 'newest'],
        ['show', 'show'],
        ['ask', 'ask'],
        ['jobs', 'jobs'],
    ]) {
        await page.locator('.header-nav').getByRole('link', { name: label, exact: true }).click();
        await expect(page).toHaveURL(new RegExp(`/${feed}/1$`));
        await expect(page.getByText(`${feed} story 1-0`)).toBeVisible();
    }
    await expect(page.getByText(/These are jobs at startups/)).toBeVisible();
    await page.locator('.home-link').click();
    await expect(page).toHaveURL(/\/news\/1$/);
});

test('/item/:id lazy-loads item details with collapsible comments', async ({ page }) => {
    const chunks: string[] = [];
    page.on('request', (req) => chunks.push(new URL(req.url()).pathname));
    await page.goto('/news/1');
    await expect(page.getByText('news story 1-0')).toBeVisible();
    expect(chunks.some((p) => /ItemDetails-.*\.js$/.test(p))).toBe(false);

    await page.goto('/item/42');
    await expect(page.locator('.laptop .title')).toHaveText('Ask HN: e2e item');
    expect(chunks.some((p) => /ItemDetails-.*\.js$/.test(p))).toBe(true);
    await expect(page.getByText('Child comment')).toBeVisible();
    await page.locator('.meta', { hasText: 'alice' }).getByText('[-]').click();
    await expect(page.getByText('Child comment')).toBeHidden();
    await page.locator('.meta', { hasText: 'alice' }).getByText('[+]').click();
    await expect(page.getByText('Child comment')).toBeVisible();
});

test('/user/:id renders the profile', async ({ page }) => {
    await page.goto('/user/pg');
    await expect(page.locator('.main-details .name')).toHaveText('pg');
    await expect(page.getByText('157316 ★')).toBeVisible();
    await expect(page.getByText('Bug fixer.')).toBeVisible();
});

test('theme switching persists across reloads', async ({ page }) => {
    await page.goto('/news/1');
    await page.getByAltText('Settings').click();
    await page.getByLabel('Night').check();
    await expect(page.locator('html')).toHaveClass(/\bnight\b/);
    await page.getByLabel('Black (AMOLED)').check();
    await expect(page.locator('html')).toHaveClass(/\bamoledblack\b/);
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/\bamoledblack\b/);
    await expect(page.locator('#header')).toHaveCSS('background-color', 'rgb(0, 0, 0)');
});
