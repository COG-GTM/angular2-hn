import { expect, test } from '@playwright/test';
import { fixture, snap, useFixtures } from './helpers';

test.beforeEach(async ({ page }) => useFixtures(page));

test('item details show the story and its comment thread', async ({ page }, testInfo) => {
  const item = fixture('item-8863.json');
  await page.goto('/item/8863');
  await expect(page.locator('.laptop a.title')).toContainText(item.title);
  await expect(page.locator('.laptop .subtext')).toContainText(`${item.points} points by`);
  await expect(page.locator('app-comment').first()).toBeVisible();
  await expect(page.locator('app-comment').first()).toContainText(item.comments[0].user);
  await snap(page, testInfo, 'item-8863');
});

test('user profile shows id, karma and about', async ({ page }, testInfo) => {
  const user = fixture('user-pg.json');
  await page.goto('/user/pg');
  await expect(page.locator('.main-details .name')).toHaveText(user.id);
  await expect(page.locator('.main-details .right')).toContainText(String(user.karma));
  await expect(page.locator('.age')).toHaveText(`Created ${user.created}`);
  await expect(page.locator('.other-details')).toContainText(user.about);
  await snap(page, testInfo, 'user-pg');
});

test('unknown user shows an error message', async ({ page }) => {
  await page.goto('/user/nobody-here');
  await expect(page.locator('app-error-message')).toContainText('Could not load user nobody-here.');
});
