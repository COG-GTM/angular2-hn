import { expect, test } from '@playwright/test';

import { mockHnApi } from './fixtures';

test.describe('angular-hnpwa', () => {
  let consoleErrors: string[];

  test.beforeEach(async ({ page }) => {
    consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    await mockHnApi(page);
  });

  test.afterEach(() => {
    expect(consoleErrors).toEqual([]);
  });

  test('redirects to the top stories feed and renders 30 items', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/news\/1$/);
    await expect(page).toHaveTitle('Angular 2 HN');
    await expect(page.locator('app-item')).toHaveCount(30);
    await expect(page.locator('app-item').first()).toContainText('Story 1');
    await expect(page.getByRole('link', { name: 'More ›' })).toBeVisible();
  });

  test('paginates and switches feeds', async ({ page }) => {
    await page.goto('/news/1');
    await page.getByRole('link', { name: 'More ›' }).click();
    await expect(page).toHaveURL(/\/news\/2$/);
    await expect(page.locator('app-item')).toHaveCount(5);
    await expect(page.locator('ol')).toHaveAttribute('start', '31');
    await expect(page.getByRole('link', { name: '‹ Prev' })).toBeVisible();

    await page.getByRole('link', { name: 'show', exact: true }).click();
    await expect(page).toHaveURL(/\/show\/1$/);
    await expect(page.locator('app-item')).toHaveCount(30);
  });

  test('shows item details with nested comments', async ({ page }) => {
    await page.goto('/item/42');
    await expect(page.locator('.laptop .title')).toHaveText('Ask HN: Test item');
    await expect(page.locator('.subject')).toContainText('Item body text');
    await expect(page.locator('app-comment')).toHaveCount(2);
    await page.locator('.collapse').first().click();
    await expect(page.getByText('Reply')).toBeHidden();
  });

  test('shows a user profile', async ({ page }) => {
    await page.goto('/user/pg');
    await expect(page.locator('.main-details .name')).toHaveText('pg');
    await expect(page.locator('.main-details')).toContainText('157316 ★');
    await expect(page.locator('.other-details')).toContainText('Bug fixer.');
  });

  test('shows an error for an unknown user', async ({ page }) => {
    await page.goto('/user/nobody-xyz');
    await expect(page.locator('app-error-message')).toContainText('Could not load user nobody-xyz.');
  });

  test('persists theme selection from settings', async ({ page }) => {
    await page.goto('/news/1');
    await page.getByRole('button', { name: 'Settings' }).click();
    await page.locator('input[value="night"]').check();
    await expect(page.locator('app-root > div')).toHaveClass('night');
    await page.reload();
    await expect(page.locator('app-root > div')).toHaveClass('night');
  });
});
