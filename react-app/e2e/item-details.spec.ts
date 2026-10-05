import { expect, item, test } from './fixtures';

const API = /https:\/\/node-hnapi\.herokuapp\.com\/item\/.*/;

// The app's service worker claims the page and its fetches would bypass `page.route` mocks.
test.use({ serviceWorkers: 'block' });

test.describe('item details', () => {
  test('renders the item header, content and nested comments', async ({ page, isMobile }) => {
    await page.goto('/item/42');
    const header = page.locator(isMobile ? '.mobile.item-header' : '.laptop.item-header');
    await expect(header.locator('a.title')).toHaveText('Story 42');
    await expect(header.locator('a.title')).toHaveAttribute('href', 'https://example.com/42');
    if (!isMobile) {
      await expect(header.locator('.domain')).toHaveText(/\(example\.com\)/);
      await expect(header.locator('.subtext')).toContainText('142 points by user42');
      await expect(header.locator('.subtext')).toContainText('2 hours ago | 2 comments');
    }
    await expect(page.locator('p.subject')).toHaveText('Story body');
    await expect(page.locator('.comment-list > li')).toHaveCount(1);
    await expect(page.locator('.subtree .comment-text')).toHaveText('Nested reply');
  });

  test('collapses and expands a comment thread', async ({ page }) => {
    await page.goto('/item/42');
    const toggle = page.locator('.comment-list > li > .app-comment > .meta > .collapse');
    await expect(toggle).toHaveText('[-]');
    await toggle.click();
    await expect(toggle).toHaveText('[+]');
    await expect(page.getByText('Top level comment')).toBeHidden();
    await expect(page.getByText('Nested reply')).toBeHidden();
    await toggle.click();
    await expect(page.getByText('Nested reply')).toBeVisible();
  });

  test('navigates to the comment author profile', async ({ page }) => {
    await page.goto('/item/42');
    await page.locator('.meta').getByRole('link', { name: 'replier' }).click();
    await expect(page).toHaveURL(/\/user\/replier$/);
  });

  test('renders polls and deleted comments', async ({ page, isMobile }) => {
    await page.route(API, async (route) => {
      const id = Number(new URL(route.request().url()).pathname.split('/').pop());
      if (id === 7) {
        return route.fulfill({
          json: {
            ...item(7),
            type: 'poll',
            url: 'item?id=7',
            domain: undefined,
            poll: [{}, {}],
            comments: [{ id: 70, level: 0, deleted: true, comments: [] }],
            comments_count: 1,
          },
        });
      }
      return route.fulfill({ json: { points: id === 8 ? 3 : 1, content: `<p>Option ${id}</p>` } });
    });
    await page.goto('/item/7');
    await expect(page.locator('.pollContent')).toHaveCount(2);
    await expect(page.locator('.pollContent').first()).toContainText('Option 8');
    await expect(page.locator('.pollContent').first()).toContainText('3 points');
    const bars = page.locator('.pollBar');
    const [first, second] = [await bars.nth(0).boundingBox(), await bars.nth(1).boundingBox()];
    expect(first!.width / second!.width).toBeCloseTo(3, 1);
    await expect(page.locator('.deleted-meta')).toHaveText('[deleted] | Comment Deleted');
    const title = page.locator(isMobile ? '.mobile a.title' : '.laptop a.title');
    await expect(title).toHaveAttribute('href', '/item/7');
  });

  test('shows the error message when the item fails to load', async ({ page }) => {
    await page.route(API, (route) => route.fulfill({ status: 500, body: 'boom' }));
    await page.goto('/item/1');
    await expect(page.getByText('Could not load item comments.')).toBeVisible();
  });

  test('back button returns to the previous page on mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'The back button is only shown on mobile widths');
    await page.goto('/user/pg');
    await page.goto('/item/42');
    await page.locator('.back-button').click();
    await expect(page).toHaveURL(/\/user\/pg$/);
  });
});
