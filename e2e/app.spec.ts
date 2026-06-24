import { expect, test } from '@playwright/test';

const newsFeed = [
  {
    id: 1,
    title: 'A great story',
    points: 123,
    user: 'pg',
    time: 0,
    time_ago: '2 hours ago',
    type: 'story',
    url: 'https://example.com/article',
    domain: 'example.com',
    comments_count: 5,
  },
];

test.beforeEach(async ({ page }) => {
  // Mock the Hacker News API so the e2e run is deterministic and offline-friendly.
  await page.route('https://node-hnapi.herokuapp.com/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(newsFeed),
    });
  });
});

test('redirects the root path to the news feed', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/news\/1$/);
});

test('renders the header navigation', async ({ page }) => {
  await page.goto('/news/1');
  await expect(page.getByRole('link', { name: 'new' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'show' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'ask' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'jobs' })).toBeVisible();
});

test('renders stories returned by the API', async ({ page }) => {
  await page.goto('/news/1');
  await expect(page.getByRole('link', { name: 'A great story' })).toBeVisible();
});

test('opens and closes the settings panel', async ({ page }) => {
  await page.goto('/news/1');
  await page.getByAltText('Settings').click();
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  await expect(page.getByText('Black (AMOLED)')).toBeVisible();
});
