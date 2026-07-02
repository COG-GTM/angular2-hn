import { expect, test } from '@playwright/test';
import { mockFeed } from './support/api';

test.describe('Header (from the home screen)', () => {
  test.beforeEach(async ({ page }) => {
    await mockFeed(page);
    await page.goto('/news/1');
    await expect(page.locator('ol li.post')).toHaveCount(30);
  });

  test('logo links to /news/1', async ({ page }) => {
    await expect(page.locator('header a.home-link')).toHaveAttribute('href', '/news/1');
  });

  const navLinks = [
    { label: 'new', href: '/newest/1' },
    { label: 'show', href: '/show/1' },
    { label: 'ask', href: '/ask/1' },
    { label: 'jobs', href: '/jobs/1' },
  ];

  for (const { label, href } of navLinks) {
    test(`nav link "${label}" points to and navigates to ${href}`, async ({ page }) => {
      const link = page.locator('header .header-nav a', { hasText: new RegExp(`^${label}$`) });
      await expect(link).toHaveAttribute('href', href);

      await link.click();
      await expect(page).toHaveURL(new RegExp(`${href.replace(/\//g, '\\/')}$`));
    });
  }

  test('settings cog opens the app-settings panel, which closes via its × control', async ({
    page,
  }) => {
    const cog = page.locator('header img.settings');
    const panel = page.locator('app-settings');

    await expect(panel).toHaveCount(0);

    await cog.click();
    await expect(panel).toHaveCount(1);
    await expect(panel.locator('.popup')).toBeVisible();

    // The open panel renders a full-screen overlay that intercepts the cog, so it
    // is dismissed via the panel's own close control.
    await panel.locator('.close').click();
    await expect(panel).toHaveCount(0);
  });
});
