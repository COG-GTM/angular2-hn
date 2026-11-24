import { test, expect } from '@playwright/test';
import { fixture, mockApi, shot, waitForFeed } from './helpers';

test.beforeEach(async ({ page }) => mockApi(page));

test('author link opens the user profile', async ({ page }, testInfo) => {
  const user = fixture<any>('user-gumby');
  await page.goto('/news/1');
  await waitForFeed(page);
  await page.locator('.subtext-laptop').getByRole('link', { name: 'gumby', exact: true }).first().click();
  await expect(page).toHaveURL(/\/user\/gumby$/);
  await expect(page.locator('.main-details .name')).toHaveText(user.id);
  await expect(page.locator('.main-details .right')).toHaveText(`${user.karma} ★`);
  await expect(page.locator('.main-details .age')).toHaveText(`Created ${user.created}`);
  await expect(page.locator('.other-details')).toBeVisible();
  await shot(page, testInfo, 'user-gumby');
});

test('profile page renders directly by URL', async ({ page }, testInfo) => {
  const user = fixture<any>('user-pg');
  await page.goto('/user/pg');
  await expect(page.locator('.main-details .name')).toHaveText('pg');
  await expect(page.locator('.main-details .right')).toHaveText(`${user.karma} ★`);
  await expect(page.locator('.other-details')).toContainText(user.about);
  await shot(page, testInfo, 'user-pg');
});

test('unknown user shows nothing broken (empty API response)', async ({ page }) => {
  await page.goto('/user/zz-no-such-user-zz');
  await expect(page.locator('.profile')).toBeVisible();
  await expect(page.locator('.main-details .name')).toHaveText('');
  await expect(page.locator('app-loader')).toHaveCount(0);
  await expect(page.locator('app-error-message')).toHaveCount(0);
  await expect(page.locator('.other-details')).toHaveCount(0);
  await expect(page.locator('#footer')).toContainText('Show this project some');
});
