import { test, expect } from '@playwright/test';

test.describe('Angular HN - Playwright Tests', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Angular/);
  });

  test('should display the header', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('app-header');
    await expect(header).toBeVisible();
  });

  test('should navigate to news feed', async ({ page }) => {
    await page.goto('/');
    const feedElement = page.locator('app-feed');
    await expect(feedElement).toBeVisible();
  });

  test('should display feed items', async ({ page }) => {
    await page.goto('/news');
    const items = page.locator('app-item');
    await expect(items.first()).toBeVisible();
    const itemCount = await items.count();
    expect(itemCount).toBeGreaterThan(0);
  });

  test('should navigate between different feeds', async ({ page }) => {
    await page.goto('/');
    
    await page.goto('/newest');
    await expect(page.locator('app-feed')).toBeVisible();
    
    await page.goto('/show');
    await expect(page.locator('app-feed')).toBeVisible();
    
    await page.goto('/ask');
    await expect(page.locator('app-feed')).toBeVisible();
  });

  test('should handle item details page', async ({ page }) => {
    await page.goto('/news');
    
    await page.waitForSelector('app-item', { timeout: 10000 });
    
    const firstItemLink = page.locator('app-item a').first();
    const href = await firstItemLink.getAttribute('href');
    
    if (href && href.startsWith('/item/')) {
      await firstItemLink.click();
      await expect(page.locator('app-item-details')).toBeVisible();
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.locator('app-header')).toBeVisible();
    await expect(page.locator('app-feed')).toBeVisible();
  });
});
