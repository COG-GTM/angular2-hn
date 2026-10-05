import { expect, story, test } from './fixtures';

test.describe('feeds', () => {
  // The PWA service worker would fetch retries/refetches itself, bypassing page.route() mocks.
  test.use({ serviceWorkers: 'block' });

  test('renders a numbered page of stories with pagination', async ({ page }) => {
    await page.goto('/news/1');
    const items = page.locator('ol > li.post');
    await expect(items).toHaveCount(30);
    await expect(page.locator('ol')).toHaveAttribute('start', '1');
    await expect(items.first().locator('a.title')).toHaveText('Story 1');
    await expect(items.first().locator('a.title')).toHaveAttribute('href', 'https://example.com/1');
    await expect(page.getByRole('link', { name: '‹ Prev' })).toHaveCount(0);

    await page.getByRole('link', { name: 'More ›' }).click();
    await expect(page).toHaveURL(/\/news\/2$/);
    await expect(page.locator('ol')).toHaveAttribute('start', '31');
    await expect(items.first().locator('a.title')).toHaveText('Story 31');
    await expect(page.evaluate(() => window.scrollY)).resolves.toBe(0);

    await page.getByRole('link', { name: '‹ Prev' }).click();
    await expect(page).toHaveURL(/\/news\/1$/);
    await expect(items.first().locator('a.title')).toHaveText('Story 1');
  });

  test('shows author, points and comments in the layout for the viewport', async ({ page, isMobile }) => {
    await page.goto('/newest/1');
    const first = page.locator('ol > li.post').first();
    const subtext = first.locator(isMobile ? '.subtext-palm' : '.subtext-laptop');
    await expect(subtext).toBeVisible();
    await expect(first.locator(isMobile ? '.subtext-laptop' : '.subtext-palm')).toBeHidden();
    if (isMobile) {
      await expect(subtext.locator('.right')).toHaveText('101 ★');
    } else {
      await expect(subtext).toContainText('101 points by user1');
    }

    await subtext.getByRole('link', { name: 'user1' }).click();
    await expect(page).toHaveURL(/\/user\/user1$/);
    await page.goBack();
    await subtext.getByRole('link', { name: /1 comment/ }).click();
    await expect(page).toHaveURL(/\/item\/1$/);
  });

  test('links self posts to the item page and hides More on a short page', async ({ page }) => {
    await page.route(/https:\/\/node-hnapi\.herokuapp\.com\/ask\?page=2/, (route) =>
      route.fulfill({ json: [story(31, { title: 'Ask HN: Anything?', url: 'item?id=31', domain: undefined })] })
    );
    await page.goto('/ask/2');
    const title = page.getByRole('link', { name: 'Ask HN: Anything?' });
    await expect(title).toHaveAttribute('href', '/item/31');
    await expect(page.locator('.domain')).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'More ›' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: '‹ Prev' })).toHaveAttribute('href', '/ask/1');
  });

  test('shows the jobs header and hides points/author for jobs', async ({ page }) => {
    await page.route(/https:\/\/node-hnapi\.herokuapp\.com\/jobs\?page=1/, (route) =>
      route.fulfill({ json: [story(7, { type: 'job', title: 'Acme is hiring', points: null, user: null })] })
    );
    await page.goto('/jobs/1');
    await expect(page.locator('.job-header')).toContainText('funded by Y Combinator');
    const item = page.locator('ol > li.post');
    await expect(item).toHaveCount(1);
    await expect(item.locator('a[href^="/user/"]')).toHaveCount(0);
    await expect(item.locator('a[href="/item/7"]')).toHaveCount(0);
    await expect(item).not.toContainText('points');
  });

  test('shows the error message when the feed fails to load', async ({ page }) => {
    await page.route(/https:\/\/node-hnapi\.herokuapp\.com\/show\?page=1/, (route) => route.fulfill({ status: 500 }));
    await page.goto('/show/1');
    await expect(page.getByRole('alert')).toContainText('Could not load show stories.');
  });

  test('honours the open-in-new-tab, font size and spacing settings', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('openLinkInNewTab', 'true');
      localStorage.setItem('titleFontSize', '20');
      localStorage.setItem('listSpacing', '10');
    });
    await page.goto('/news/1');
    const title = page.locator('ol > li.post a.title').first();
    await expect(title).toHaveAttribute('target', '_blank');
    await expect(title).toHaveAttribute('rel', 'noopener');
    await expect(title).toHaveCSS('font-size', '20px');
    await expect(page.locator('.item-block > div').first()).toHaveCSS('margin-bottom', '10px');
  });
});
