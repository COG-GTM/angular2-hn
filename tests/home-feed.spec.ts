import { expect, test } from '@playwright/test';
import { mockFeed, mockFeedDeferred, mockFeedError, newsStories } from './support/api';

test.describe('Home / news feed (news/1)', () => {
  test('redirects the root route to /news/1', async ({ page }) => {
    await mockFeed(page);

    await page.goto('/');

    await expect(page).toHaveURL(/\/news\/1$/);
  });

  test('shows the loader while the API request is pending and no list yet', async ({ page }) => {
    const release = await mockFeedDeferred(page);

    await page.goto('/news/1');

    await expect(page.locator('app-loader')).toBeVisible();
    await expect(page.locator('ol')).toHaveCount(0);

    release();

    await expect(page.locator('ol')).toBeVisible();
    await expect(page.locator('app-loader')).toHaveCount(0);
  });

  test('renders an ordered list of 30 story items once loaded', async ({ page }) => {
    await mockFeed(page);

    await page.goto('/news/1');

    await expect(page.locator('ol')).toBeVisible();
    await expect(page.locator('ol li.post')).toHaveCount(30);
    await expect(page.locator('ol li.post item')).toHaveCount(30);
  });

  test('renders titles and links for stories with and without a url', async ({ page }) => {
    const stories = newsStories();
    await mockFeed(page, stories);

    await page.goto('/news/1');
    await expect(page.locator('ol li.post')).toHaveCount(30);

    const external = stories[0];
    const externalItem = page.locator('ol li.post').nth(0);
    const externalLink = externalItem.locator('a.title');
    await expect(externalLink).toHaveText(external.title);
    await expect(externalLink).toHaveAttribute('href', external.url);

    const internal = stories[1];
    expect(internal.url).toBe('');
    const internalItem = page.locator('ol li.post').nth(1);
    const internalLink = internalItem.locator('a.title');
    await expect(internalLink).toHaveText(internal.title);
    await expect(internalLink).toHaveAttribute('href', `/item/${internal.id}`);
  });

  test('renders points, user, time and comments for a non-job story', async ({ page }) => {
    const stories = newsStories();
    await mockFeed(page, stories);

    await page.goto('/news/1');
    await expect(page.locator('ol li.post')).toHaveCount(30);

    const story = stories[0];
    const item = page.locator('ol li.post').nth(0);

    // The item renders two responsive variants (palm/laptop); assert the markup
    // is present rather than visible so the test is viewport-independent.
    await expect(item.getByText(`${story.points} ★`)).toBeAttached();
    await expect(item.getByText(`${story.points} points by`)).toBeAttached();
    await expect(item.locator(`a[href="/user/${story.user}"]`).first()).toBeAttached();
    await expect(item.getByText(story.time_ago).first()).toBeAttached();
    await expect(item.locator(`a.comment-number[href="/item/${story.id}"]`)).toBeAttached();
  });

  test('does not render the author/points/comments block for a job story', async ({ page }) => {
    const stories = newsStories();
    await mockFeed(page, stories);

    await page.goto('/news/1');
    await expect(page.locator('ol li.post')).toHaveCount(30);

    const job = stories[2];
    expect(job.type).toBe('job');
    const item = page.locator('ol li.post').nth(2);

    await expect(item.locator('a.title')).toHaveText(job.title);
    await expect(item.locator('.details a.comment-number')).toHaveCount(0);
    await expect(item.locator(`a[href="/user/${job.user}"]`)).toHaveCount(0);
  });

  test('does not render "‹ Prev" on page 1 and renders "More ›" to /news/2 with 30 items', async ({
    page,
  }) => {
    await mockFeed(page);

    await page.goto('/news/1');
    await expect(page.locator('ol li.post')).toHaveCount(30);

    await expect(page.locator('a.prev')).toHaveCount(0);
    const more = page.locator('a.more');
    await expect(more).toBeVisible();
    await expect(more).toHaveAttribute('href', '/news/2');
  });

  test('does not render "More ›" when fewer than 30 items are returned', async ({ page }) => {
    await mockFeed(page, newsStories(5));

    await page.goto('/news/1');
    await expect(page.locator('ol li.post')).toHaveCount(5);

    await expect(page.locator('a.more')).toHaveCount(0);
    await expect(page.locator('a.prev')).toHaveCount(0);
  });

  test('shows the error message and no list when the API fails', async ({ page }) => {
    await mockFeedError(page);

    await page.goto('/news/1');

    const error = page.locator('app-error-message');
    await expect(error).toBeVisible();
    await expect(error).toContainText('Could not load news stories.');
    await expect(page.locator('ol')).toHaveCount(0);
  });
});
