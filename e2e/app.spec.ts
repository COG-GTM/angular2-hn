import { expect, test } from '@playwright/test';

import { mockHackerNewsApi } from './fixtures';

test.beforeEach(async ({ page }) => {
  await mockHackerNewsApi(page);
});

test('redirects to the top stories feed and paginates', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/news\/1$/);
  await expect(page.locator('li.post')).toHaveCount(30);
  await expect(page.locator('li.post').first()).toContainText('Story number 1');

  await page.getByRole('link', { name: 'More ›' }).click();
  await expect(page).toHaveURL(/\/news\/2$/);
  await expect(page.locator('ol')).toHaveAttribute('start', '31');
});

test('navigates between feeds from the header', async ({ page }) => {
  await page.goto('/news/1');
  await page.locator('.header-nav').getByRole('link', { name: 'show' }).click();
  await expect(page).toHaveURL(/\/show\/1$/);
  await expect(page.locator('li.post')).toHaveCount(30);
});

test('opens an item with nested comments and collapses them', async ({ page }) => {
  await page.goto('/news/1');
  await page.locator('.subtext-laptop').first().getByRole('link', { name: 'discuss' }).click();
  await expect(page).toHaveURL(/\/item\/1000$/);
  await expect(page.getByText('Top level comment')).toBeVisible();
  await expect(page.getByText('Nested reply')).toBeVisible();

  await page.locator('app-comment .collapse').first().click();
  await expect(page.getByText('Nested reply')).toBeHidden();
});

test('shows a user profile', async ({ page }) => {
  await page.goto('/user/pg');
  await expect(page.locator('.main-details .name')).toHaveText('pg');
  await expect(page.getByText('Bug fixer.')).toBeVisible();
});

test('persists the theme chosen in settings', async ({ page }) => {
  await page.goto('/news/1');
  await page.getByAltText('Settings').click();
  await page.getByLabel('Night').check();
  await expect(page.locator('app-root > div')).toHaveClass('night');

  await page.reload();
  await expect(page.locator('app-root > div')).toHaveClass('night');
});

test.describe('PWA', () => {
  test.use({ serviceWorkers: 'allow' });

  test('registers the Angular service worker in the production build', async ({ page }) => {
    await page.goto('/news/1');
    const scriptURL = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready;
      return registration.active?.scriptURL;
    });
    expect(scriptURL).toMatch(/\/ngsw-worker\.js$/);
  });
});
