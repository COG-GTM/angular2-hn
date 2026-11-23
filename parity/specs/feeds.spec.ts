import { test, expect, fixture, snap, commentLabel, MOBILE } from './support';

const feeds = ['news', 'newest', 'show', 'ask', 'jobs'] as const;

test('root redirects to /news/1', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/news\/1$/);
  await expect(page.locator('li.post').first()).toBeVisible();
});

for (const feed of feeds) {
  test(`${feed} page 1 lists the feed`, async ({ page }, testInfo) => {
    const items = fixture<any[]>(`${feed}-1`);
    await page.goto(`/${feed}/1`);
    const posts = page.locator('li.post');
    await expect(posts).toHaveCount(items.length);
    await expect(page.locator('ol')).toHaveAttribute('start', '1');
    await expect(posts.first().locator('a.title')).toHaveText(items[0].title);
    await expect(posts.last().locator('a.title')).toHaveText(items[items.length - 1].title);
    if (feed === 'jobs') {
      await expect(page.locator('.job-header')).toContainText('These are jobs at startups that were funded by Y Combinator.');
      await expect(posts.first().locator('.subtext-laptop')).not.toContainText('points by');
    } else {
      await expect(page.locator('.job-header')).toHaveCount(0);
      const first = items[0];
      await expect(posts.first().locator('.subtext-laptop')).toContainText(`${first.points} points by ${first.user}`);
      await expect(posts.first().locator('.subtext-laptop')).toContainText(commentLabel(first.comments_count));
    }
    await expect(page.locator('.nav .prev')).toHaveCount(0);
    await expect(page.locator('.nav .more')).toHaveCount(items.length === 30 ? 1 : 0);
    await snap(page, testInfo, `feed-${feed}-1`);
  });
}

test('external links show domain, internal links route to item', async ({ page }) => {
  const items = fixture<any[]>('ask-1');
  await page.goto('/ask/1');
  const first = page.locator('li.post').first();
  await expect(first.locator('a.title')).toHaveAttribute('href', `/item/${items[0].id}`);
  await expect(first.locator('.domain')).toHaveCount(0);

  const news = fixture<any[]>('news-1');
  await page.goto('/news/1');
  const link = page.locator('li.post').first().locator('a.title');
  await expect(link).toHaveAttribute('href', news[0].url);
  await expect(link).not.toHaveAttribute('target', '_blank');
  await expect(page.locator('li.post').first().locator('.domain')).toHaveText(`(${news[0].domain})`);
});

test('every comment label matches the comment count', async ({ page }) => {
  const items = fixture<any[]>('newest-1');
  await page.goto('/newest/1');
  const labels = page.locator('li.post .subtext-laptop .item-details a');
  await expect(labels).toHaveCount(items.length);
  await expect(labels).toHaveText(items.map((i) => commentLabel(i.comments_count)));
});

test('pagination: More goes to page 2, Prev goes back', async ({ page }, testInfo) => {
  const page2 = fixture<any[]>('news-2');
  await page.goto('/news/1');
  await page.locator('.nav .more').click();
  await expect(page).toHaveURL(/\/news\/2$/);
  await expect(page.locator('ol')).toHaveAttribute('start', '31');
  await expect(page.locator('li.post').first().locator('a.title')).toHaveText(page2[0].title);
  await expect(page.locator('.nav .prev')).toBeVisible();
  await snap(page, testInfo, 'feed-news-2');
  await page.locator('.nav .prev').click();
  await expect(page).toHaveURL(/\/news\/1$/);
  await expect(page.locator('ol')).toHaveAttribute('start', '1');
});

test('header nav links route to each feed and mark the active one', async ({ page }) => {
  await page.goto('/news/1');
  for (const [label, feed] of [['new', 'newest'], ['show', 'show'], ['ask', 'ask'], ['jobs', 'jobs']]) {
    await page.locator('.header-nav a', { hasText: new RegExp(`^${label}$`) }).click();
    await expect(page).toHaveURL(new RegExp(`/${feed}/1$`));
    await expect(page.locator('.header-nav a.active')).toHaveText(label);
    await expect(page.locator('li.post').first()).toBeVisible();
  }
  await page.locator('a.home-link').click();
  await expect(page).toHaveURL(/\/news\/1$/);
});

test('feed load failure shows the error message', async ({ page }, testInfo) => {
  await page.route(/node-hnapi\.herokuapp\.com\/news/, (route) =>
    route.fulfill({ status: 500, contentType: 'text/html', body: '<pre>Internal error</pre>' })
  );
  await page.goto('/news/1');
  await expect(page.locator('.error-section .strong')).toHaveText('Could not load news stories.');
  await expect(page.locator('.error-section')).toContainText("If you are offline viewing, you'll need to visit this page");
  await snap(page, testInfo, 'feed-error');
});

test('mobile feed layout', async ({ page }, testInfo) => {
  const items = fixture<any[]>('news-1');
  await page.setViewportSize(MOBILE);
  await page.goto('/news/1');
  const first = page.locator('li.post').first();
  await expect(first.locator('.subtext-palm')).toBeVisible();
  await expect(first.locator('.subtext-laptop')).toBeHidden();
  await expect(first.locator('.subtext-palm .right')).toHaveText(`${items[0].points} ★`);
  await expect(page.locator('#footer')).toBeHidden();
  await snap(page, testInfo, 'mobile-feed-news-1');
});
