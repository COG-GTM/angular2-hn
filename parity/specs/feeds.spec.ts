import { test, expect } from '@playwright/test';
import { fixture, mockApi, shot, waitForFeed } from './helpers';

test.beforeEach(async ({ page }) => mockApi(page));

test('root redirects to /news/1', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/news\/1$/);
  await waitForFeed(page);
  await expect(page).toHaveTitle('Angular 2 HN');
});

test('news page 1 lists 30 stories with titles, points and pagination', async ({ page }, testInfo) => {
  const items = fixture<any[]>('news-1');
  await page.goto('/news/1');
  await waitForFeed(page);
  await expect(page.locator('li.post')).toHaveCount(30);
  await expect(page.locator('ol')).toHaveAttribute('start', '1');
  const titles = page.locator('li.post a.title');
  await expect(titles.first()).toHaveText(items[0].title);
  await expect(titles.nth(29)).toHaveText(items[29].title);
  const laptop = page.locator('li.post').first().locator('.subtext-laptop');
  await expect(laptop).toContainText(`${items[0].points} points by ${items[0].user}`);
  await expect(laptop).toContainText(items[0].time_ago);
  await expect(page.getByText('‹ Prev')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'More ›' })).toBeVisible();
  await shot(page, testInfo, 'news-page-1');
});

test('More goes to page 2, numbering continues at 31, Prev goes back', async ({ page }, testInfo) => {
  const page2 = fixture<any[]>('news-2');
  await page.goto('/news/1');
  await waitForFeed(page);
  await page.getByRole('link', { name: 'More ›' }).click();
  await expect(page).toHaveURL(/\/news\/2$/);
  await expect(page.locator('li.post a.title').first()).toHaveText(page2[0].title);
  await expect(page.locator('ol')).toHaveAttribute('start', '31');
  await expect(page.getByRole('link', { name: '‹ Prev' })).toBeVisible();
  await shot(page, testInfo, 'news-page-2');
  await page.getByRole('link', { name: '‹ Prev' }).click();
  await expect(page).toHaveURL(/\/news\/1$/);
  await expect(page.locator('ol')).toHaveAttribute('start', '1');
});

for (const feed of ['newest', 'show', 'ask', 'jobs']) {
  const label = feed === 'newest' ? 'new' : feed;
  test(`header nav "${label}" opens the ${feed} feed`, async ({ page }, testInfo) => {
    const items = fixture<any[]>(`${feed}-1`);
    await page.goto('/news/1');
    await waitForFeed(page);
    await page.locator('.header-nav').getByRole('link', { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/${feed}/1$`));
    await expect(page.locator('li.post a.title').first()).toHaveText(items[0].title);
    await expect(page.locator('li.post')).toHaveCount(items.length);
    await expect(page.locator('.header-nav a.active')).toHaveText(label);
    if (feed === 'jobs') {
      await expect(page.locator('.job-header')).toContainText('These are jobs at startups that were funded by Y Combinator.');
      await expect(page.locator('li.post').first().locator('.subtext-laptop')).not.toContainText('points by');
    } else {
      await expect(page.locator('.job-header')).toHaveCount(0);
    }
    await shot(page, testInfo, `feed-${feed}`);
  });
}

test('logo link returns to news page 1', async ({ page }) => {
  await page.goto('/show/1');
  await waitForFeed(page);
  await page.locator('a.home-link').click();
  await expect(page).toHaveURL(/\/news\/1$/);
  await waitForFeed(page);
});

test('feed shows an error message when the API is unreachable', async ({ page }, testInfo) => {
  await page.unrouteAll();
  await mockApi(page, { fail: true });
  await page.goto('/news/1');
  await expect(page.getByText('Could not load news stories.')).toBeVisible();
  await expect(page.getByText("If you are offline viewing, you'll need to visit this page")).toBeVisible();
  await shot(page, testInfo, 'feed-error');
});
