import { expect, test } from '@playwright/test';
import { fixture, snap, useFixtures } from './helpers';

test.beforeEach(async ({ page }) => useFixtures(page));

test('root redirects to news page 1 with 30 ranked stories', async ({ page }, testInfo) => {
  const news = fixture('news-1.json');
  await page.goto('/');
  await expect(page).toHaveURL(/\/news\/1$/);
  const posts = page.locator('li.post');
  await expect(posts).toHaveCount(30);
  await expect(page.locator('ol')).toHaveAttribute('start', '1');
  await expect(posts.first().locator('a.title')).toHaveText(news[0].title);
  await expect(page.locator('.nav .prev')).toHaveCount(0);
  await snap(page, testInfo, 'news-1');
});

test('More goes to page 2, which continues the ranking at 31', async ({ page }, testInfo) => {
  const news2 = fixture('news-2.json');
  await page.goto('/news/1');
  await page.locator('.nav .more').click();
  await expect(page).toHaveURL(/\/news\/2$/);
  await expect(page.locator('ol')).toHaveAttribute('start', '31');
  await expect(page.locator('li.post').first().locator('a.title')).toHaveText(news2[0].title);
  await page.locator('.nav .prev').click();
  await expect(page).toHaveURL(/\/news\/1$/);
  await page.goto('/news/2');
  await expect(page.locator('li.post')).toHaveCount(30);
  await snap(page, testInfo, 'news-2');
});

for (const feed of ['newest', 'show', 'ask', 'jobs']) {
  const label = feed === 'newest' ? 'new' : feed;
  test(`header "${label}" link opens the ${feed} feed`, async ({ page }, testInfo) => {
    const items = fixture(`${feed}-1.json`);
    await page.goto('/news/1');
    await page.locator('.header-nav a', { hasText: new RegExp(`^${label}$`) }).click();
    await expect(page).toHaveURL(new RegExp(`/${feed}/1$`));
    await expect(page.locator('li.post')).toHaveCount(items.length);
    await expect(page.locator('li.post').first().locator('a.title')).toHaveText(items[0].title);
    if (feed === 'jobs') {
      await expect(page.locator('.job-header')).toContainText('funded by Y Combinator');
    }
    await snap(page, testInfo, `${feed}-1`);
  });
}

test('story links go to item details and user profile', async ({ page }) => {
  const news = fixture('news-1.json');
  const story = news.find((s: any) => s.type !== 'job');
  await page.goto('/news/1');
  const laptop = page.locator('li.post').filter({ hasText: story.title }).first().locator('.subtext-laptop');
  await expect(laptop.locator(`a[href="/user/${story.user}"]`)).toBeVisible();
  await expect(laptop.locator(`a[href="/item/${story.id}"]`)).toBeVisible();
});
