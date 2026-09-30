import { expect, test, type Page } from '@playwright/test';
import { meta, useFixtures } from './fixtures.ts';

const bodyCoverBackground = (page: Page) =>
    page.locator('.body-cover').evaluate((el) => getComputedStyle(el).backgroundColor);

const selectTheme = async (page: Page, label: string) => {
    await page.click('img.settings');
    await page.getByLabel(label).check();
    await page.click('.popup .close');
    await expect(page.locator('.popup')).toHaveCount(0);
};

test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await useFixtures(page);
});

test('redirects / to /news/1', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/news\/1$/);
    await expect(page.locator('.post')).toHaveCount(30);
    await expect(page.locator('.home-link')).toHaveClass(/active/);
});

test('header navigation opens each feed', async ({ page }) => {
    await page.goto('/news/1');
    for (const [label, path] of [
        ['new', '/newest/1'],
        ['show', '/show/1'],
        ['ask', '/ask/1'],
        ['jobs', '/jobs/1'],
    ]) {
        await page.locator('.header-nav').getByRole('link', { name: label, exact: true }).click();
        await expect(page).toHaveURL(new RegExp(`${path}$`));
        await expect(page.locator('.post').first()).toBeVisible();
        await expect(page.locator('.header-nav .active')).toHaveText(label);
    }
    await expect(page.locator('.job-header')).toContainText('funded by Y Combinator');
});

test('pagination moves between pages with correct numbering', async ({ page }) => {
    await page.goto('/news/1');
    await expect(page.locator('.nav .prev')).toHaveCount(0);
    await expect(page.locator('ol')).toHaveAttribute('start', '1');
    await page.locator('.nav .more').click();
    await expect(page).toHaveURL(/\/news\/2$/);
    await expect(page.locator('ol')).toHaveAttribute('start', '31');
    await expect(page.locator('.nav .prev')).toBeVisible();
    await page.locator('.nav .prev').click();
    await expect(page).toHaveURL(/\/news\/1$/);
    await expect(page.locator('ol')).toHaveAttribute('start', '1');
});

test('opens item comments and collapses a thread', async ({ page }) => {
    await page.goto('/news/1');
    await page.locator(`.subtext-laptop a[href="/item/${meta.itemId}"]`).click();
    await expect(page).toHaveURL(new RegExp(`/item/${meta.itemId}$`));
    const first = page.locator('.comment-list > li').first();
    await expect(first.locator('.comment-text').first()).toBeVisible();
    const toggle = first.locator('.collapse').first();
    await expect(toggle).toHaveText('[-]');
    await toggle.click();
    await expect(toggle).toHaveText('[+]');
    await expect(first.locator('.comment-text').first()).toBeHidden();
    await toggle.click();
    await expect(first.locator('.comment-text').first()).toBeVisible();
});

test('opens a user profile from the feed and from an item', async ({ page }) => {
    await page.goto('/news/1');
    await page.locator(`.subtext-laptop a[href="/user/${meta.userId}"]`).first().click();
    await expect(page).toHaveURL(new RegExp(`/user/${meta.userId}$`));
    await expect(page.locator('.main-details .name')).toHaveText(meta.userId);
    await expect(page.locator('.main-details .age')).toContainText('Created');

    await page.goto(`/item/${meta.itemId}`);
    await page.locator(`.laptop .subtext a[href="/user/${meta.userId}"]`).click();
    await expect(page).toHaveURL(new RegExp(`/user/${meta.userId}$`));
});

test('shows an error for an unknown user', async ({ page }) => {
    await page.goto('/user/no-such-user');
    await expect(page.locator('.error-section .strong')).toHaveText('Could not load user no-such-user.');
});

test('theme switching applies and persists', async ({ page }) => {
    await page.goto('/news/1');
    await expect(page.locator('.body-cover')).toBeVisible();
    await expect.poll(() => bodyCoverBackground(page)).toBe('rgb(255, 255, 255)');

    await selectTheme(page, 'Night');
    await expect(page.locator('div.night')).toHaveCount(1);
    await expect.poll(() => bodyCoverBackground(page)).toBe('rgb(55, 71, 79)');
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('night');

    await page.reload();
    await expect(page.locator('div.night')).toHaveCount(1);

    await selectTheme(page, 'Black (AMOLED)');
    await expect.poll(() => bodyCoverBackground(page)).toBe('rgb(0, 0, 0)');

    await selectTheme(page, 'Default');
    await expect(page.locator('div.default')).toHaveCount(1);
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('default');
});

test('settings control link target, font size and spacing', async ({ page }) => {
    await page.goto('/news/1');
    const externalTitle = page.locator('.item-block a.title[href^="http"]').first();
    await expect(externalTitle).not.toHaveAttribute('target', '_blank');

    await page.click('img.settings');
    await page.locator('.popup input[type=checkbox]').check();
    const [font, spacing] = await page.locator('.popup input[type=number]').all();
    await font.fill('20');
    await font.press('Enter');
    await spacing.fill('10');
    await spacing.press('Enter');
    await page.click('.popup .close');

    await expect(externalTitle).toHaveAttribute('target', '_blank');
    await expect(externalTitle).toHaveCSS('font-size', '20px');
    await expect(page.locator('.item-block > div').first()).toHaveCSS('margin-bottom', '10px');

    await page.reload();
    await expect(externalTitle).toHaveAttribute('target', '_blank');
    await expect(externalTitle).toHaveCSS('font-size', '20px');
    expect(await page.evaluate(() => ({ ...localStorage }))).toMatchObject({
        openLinkInNewTab: 'true',
        titleFontSize: '20',
        listSpacing: '10',
    });
});
