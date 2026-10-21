import { expect, STORY_ID, test } from './fixtures';

test.describe('feeds', () => {
  test('redirects / to /news/1 and lists 30 stories from 1', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/news\/1$/);
    const list = page.locator('ol.list-margin');
    await expect(list).toHaveAttribute('start', '1');
    await expect(list.locator('li.post')).toHaveCount(30);
    await expect(page.getByRole('link', { name: 'news story 1', exact: true })).toHaveAttribute(
      'href',
      'https://example.com/1'
    );
  });

  test('paginates with More and Prev', async ({ page }) => {
    await page.goto('/news/1');
    await expect(page.locator('.nav .prev')).toHaveCount(0);
    await page.locator('.nav .more').click();
    await expect(page).toHaveURL(/\/news\/2$/);
    await expect(page.locator('ol')).toHaveAttribute('start', '31');
    await expect(page.getByText('news story 31', { exact: true })).toBeVisible();

    await page.locator('.nav .more').click();
    await expect(page).toHaveURL(/\/news\/3$/);
    await expect(page.locator('li.post')).toHaveCount(5);
    await expect(page.locator('.nav .more')).toHaveCount(0);

    await page.locator('.nav .prev').click();
    await expect(page).toHaveURL(/\/news\/2$/);
  });

  test('header nav switches feeds and highlights the active one', async ({ page }) => {
    await page.goto('/news/1');
    const newest = page.locator('.header-nav').getByRole('link', { name: 'new', exact: true });
    await newest.click();
    await expect(page).toHaveURL(/\/newest\/1$/);
    await expect(newest).toHaveClass(/active/);
    await expect(page.getByText('newest story 1', { exact: true })).toBeVisible();

    await page.locator('.header-nav').getByRole('link', { name: 'jobs' }).click();
    await expect(page.locator('.job-header')).toContainText('funded by Y Combinator');
    await expect(page.locator('ol')).not.toHaveClass(/list-margin/);
  });

  test('shows the error state when the feed fails', async ({ page }) => {
    await page.route('**/show?page=1', (route) => route.fulfill({ status: 500, body: '' }));
    await page.goto('/show/1');
    await expect(page.locator('.error-section')).toContainText('Could not load show stories.');
  });
});

test.describe('item details', () => {
  test('opens a story from the feed comments link', async ({ page }) => {
    await page.goto('/news/1');
    await page.locator('li.post').first().locator('a[href="/item/1"]:visible').first().click();
    await expect(page).toHaveURL(/\/item\/1$/);
  });

  test('renders the recursive comment tree, collapse, and sanitized HTML', async ({ page }) => {
    await page.goto(`/item/${STORY_ID}`);
    await expect(page.locator('.laptop .title, .mobile .title').first()).toContainText('A story with comments');

    const top = page.locator('.comment-list > li').first();
    await expect(top.locator('.comment-text').first()).toHaveText('Top-level comment');
    const nested = top.locator('.subtree .comment-text');
    await expect(nested).toHaveText('Nested reply');

    await top.locator('.collapse').first().click();
    await expect(top.locator('.collapse').first()).toHaveText('[+]');
    await expect(nested).toBeHidden();
    await top.locator('.collapse').first().click();
    await expect(nested).toBeVisible();

    await expect(page.locator('img[onerror]')).toHaveCount(0);
    expect(await page.evaluate(() => (window as { __xss?: number }).__xss)).toBeUndefined();
  });

  test('comment author links to the user page', async ({ page }) => {
    await page.goto(`/item/${STORY_ID}`);
    await page.locator('.meta').getByRole('link', { name: 'dang' }).click();
    await expect(page).toHaveURL(/\/user\/dang$/);
  });
});

test.describe('user', () => {
  test('renders a profile', async ({ page }) => {
    await page.goto('/user/pg');
    await expect(page.locator('.main-details .name')).toHaveText('pg');
    await expect(page.locator('.main-details .right')).toHaveText('157316 ★');
    await expect(page.locator('.main-details .age')).toHaveText('Created 19 years ago');
    await expect(page.locator('.other-details a')).toHaveAttribute('href', 'https://paulgraham.com');
  });

  test('shows the error state for an unknown user', async ({ page }) => {
    await page.goto('/user/nobody');
    await expect(page.locator('.error-section')).toContainText('Could not load user nobody.');
  });
});

test.describe('settings', () => {
  test('switches theme and persists it across reloads', async ({ page }) => {
    await page.goto('/news/1');
    const root = page.getByTestId('app-root');
    await expect(root).toHaveClass('default');

    await page.getByRole('button', { name: 'Settings' }).click();
    await page.getByLabel('Night').check();
    await expect(root).toHaveClass('night');
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.locator('.overlay')).toHaveCount(0);

    await page.reload();
    await expect(root).toHaveClass('night');
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('night');
  });

  test('follows the system dark preference when no theme is saved', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/news/1');
    await expect(page.getByTestId('app-root')).toHaveClass('night');
  });

  test('applies font size, list spacing and open-in-new-tab to story rows', async ({ page }) => {
    await page.goto('/news/1');
    await page.getByRole('button', { name: 'Settings' }).click();
    await page.getByLabel('Font size:').fill('24');
    await page.getByLabel('List spacing:').fill('30');
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Close' }).click();

    const title = page.locator('li.post').first().locator('a.title');
    await expect(title).toHaveCSS('font-size', '24px');
    await expect(title).toHaveAttribute('target', '_blank');
    await expect(page.locator('.item-block > div').first()).toHaveCSS('margin-bottom', '30px');
  });
});
