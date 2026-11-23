import { test, expect, fixture, snap, MOBILE } from './support';

test('user profile shows id, karma, age and about', async ({ page }, testInfo) => {
  const user = fixture('user-pg');
  await page.goto('/user/pg');
  await expect(page.locator('.main-details .name')).toHaveText(user.id);
  await expect(page.locator('.main-details .right')).toHaveText(`${user.karma} ★`);
  await expect(page.locator('.main-details .age')).toHaveText(`Created ${user.created}`);
  await expect(page.locator('.other-details')).toHaveText(user.about);
  await snap(page, testInfo, 'user-pg');
});

test('user about renders HTML', async ({ page }, testInfo) => {
  const user = fixture('user-dang');
  await page.goto('/user/dang');
  await expect(page.locator('.main-details .name')).toHaveText('dang');
  const anchors = (user.about.match(/<a /g) ?? []).length;
  await expect(page.locator('.other-details a')).toHaveCount(anchors);
  await expect(page.locator('.other-details p').first()).not.toContainText('<');
  await snap(page, testInfo, 'user-dang');
});

test('unknown user shows the error message', async ({ page }) => {
  await page.goto('/user/nobody-here');
  await expect(page.locator('.error-section .strong')).toHaveText('Could not load user nobody-here.');
});

test('feed author link opens the profile', async ({ page }) => {
  await page.route(/(node-hnapi\.herokuapp\.com|api\.hnpwa\.com).*\/user\/[^/]+/, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(fixture('user-pg')) })
  );
  await page.goto('/news/1');
  await page.locator('li.post .subtext-laptop a').first().click();
  await expect(page).toHaveURL(/\/user\/[^/]+$/);
  await expect(page.locator('.main-details .name')).toHaveText('pg');
});

test('mobile profile bar and back button', async ({ page }, testInfo) => {
  await page.setViewportSize(MOBILE);
  await page.goto('/news/1');
  await page.goto('/user/pg');
  await expect(page.locator('.mobile.item-header .title-block')).toHaveText(/Profile: pg/);
  await snap(page, testInfo, 'mobile-user-pg');
  await page.locator('.back-button').click();
  await expect(page).toHaveURL(/\/news\/1$/);
});
