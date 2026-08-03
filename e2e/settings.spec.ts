import { expect, test } from '@playwright/test';

import { mockHackerNewsApi } from './fixtures/hn-api';

test.beforeEach(async ({ page }) => {
    await mockHackerNewsApi(page);
});

test('switches themes and remembers the choice', async ({ page }) => {
    await page.goto('/news/1');

    await page.getByRole('img', { name: 'Settings' }).click();
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();

    await page.getByRole('radio', { name: 'Night' }).check();
    await expect(page.locator('body > #root > div.night')).toBeVisible();

    await page.getByRole('button', { name: 'Close settings' }).click();
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeHidden();

    await page.reload();
    await expect(page.locator('body > #root > div.night')).toBeVisible();

    await page.getByRole('img', { name: 'Settings' }).click();
    await page.getByRole('radio', { name: 'Black (AMOLED)' }).check();
    await expect(page.locator('body > #root > div.amoledblack')).toBeVisible();
});

test('opens story links in a new tab once enabled', async ({ page }) => {
    await page.goto('/news/1');
    const title = page.getByRole('link', { name: 'Page 1 story 1', exact: true });

    await expect(title).not.toHaveAttribute('target', '_blank');

    await page.getByRole('img', { name: 'Settings' }).click();
    await page.getByRole('checkbox', { name: /Open links in a new tab/ }).check();
    await page.getByRole('button', { name: 'Close settings' }).click();

    await expect(title).toHaveAttribute('target', '_blank');
});

test('applies the title font size and list spacing', async ({ page }) => {
    await page.goto('/news/1');

    await page.getByRole('img', { name: 'Settings' }).click();
    await page.getByRole('spinbutton', { name: /Font size/ }).fill('24');
    await page.getByRole('spinbutton', { name: /List spacing/ }).fill('12');
    await page.getByRole('button', { name: 'Close settings' }).click();

    await expect(page.getByRole('link', { name: 'Page 1 story 1', exact: true })).toHaveCSS('font-size', '24px');
    await expect(page.locator('li.post > div').first()).toHaveCSS('margin-bottom', '12px');
});

test('registers a service worker so the app shell works offline', async ({ page }) => {
    await page.goto('/news/1');

    await expect
        .poll(() => page.evaluate(async () => Boolean(await navigator.serviceWorker.getRegistration())), {
            timeout: 15_000,
        })
        .toBe(true);
});
