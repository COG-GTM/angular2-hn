import { expect, test } from './fixtures';

test.describe('user page', () => {
  // The service worker claims the page and its fetches bypass page.route, so keep it out of these API-mocked tests.
  test.use({ serviceWorkers: 'block' });

  test('renders the profile from the API', async ({ page }) => {
    await page.goto('/user/pg');
    const profile = page.locator('.profile');
    await expect(profile.locator('.main-details .name')).toHaveText('pg');
    await expect(profile.locator('.main-details .right')).toHaveText('157316 ★');
    await expect(profile.locator('.main-details .age')).toHaveText('Created 19 years ago');
    await expect(profile.locator('.other-details')).toHaveText('Bug fixer.');
  });

  test('shows the mobile header with a back button only on small screens', async ({ page, isMobile }) => {
    await page.goto('/user/pg');
    const header = page.locator('.profile .item-header');
    await expect(header).toHaveText('Profile: pg');
    if (isMobile) {
      await expect(header).toBeVisible();
    } else {
      await expect(header).toBeHidden();
    }
  });

  test('back button returns to the previous page', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'the back button is only visible on mobile');
    await page.goto('/news/1');
    await page.goto('/user/pg');
    await page.locator('.profile .back-button').click();
    await expect(page).toHaveURL(/\/news\/1$/);
  });

  test('shows an error for an unknown user', async ({ page }) => {
    await page.route(/https:\/\/api\.hnpwa\.com\/v0\/user\/.*/, (route) => route.fulfill({ status: 404, body: '' }));
    await page.goto('/user/nobody-here');
    await expect(page.getByRole('alert')).toContainText('Could not load user nobody-here.');
  });

  test('shows an error when the API returns null for an unknown user', async ({ page }) => {
    await page.route(/https:\/\/api\.hnpwa\.com\/v0\/user\/.*/, (route) => route.fulfill({ json: null }));
    await page.goto('/user/nobody-here');
    await expect(page.getByRole('alert')).toContainText('Could not load user nobody-here.');
  });
});
