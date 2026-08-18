import { expect, test } from '@playwright/test';
import { POLL_ID, STORY_ID, stubHackerNewsApi } from './fixtures/hnApi';

test.beforeEach(async ({ page }) => {
    await stubHackerNewsApi(page);
});

test('opening an item from the feed shows its comments', async ({ page }) => {
    await page.goto('/news/1');

    await page.locator('li.post').nth(1).getByRole('link', { name: /comment/ }).click();

    await expect(page).toHaveURL(/\/item\/\d+/);
    await expect(page.locator('p.subject')).toContainText('Story body text');
    await expect(page.getByText('Top level comment')).toBeVisible();
    await expect(page.getByText('Nested reply', { exact: true })).toBeVisible();
    await expect(page.getByText('Deeply nested reply')).toBeVisible();
});

test('nested comments collapse and expand', async ({ page }) => {
    await page.goto(`/item/${STORY_ID}`);

    const nestedToggle = page.locator('.comment .subtree .collapse').first();
    await expect(nestedToggle).toHaveText('[-]');

    await nestedToggle.click();

    await expect(nestedToggle).toHaveText('[+]');
    await expect(page.getByText('Nested reply', { exact: true })).toBeHidden();
    await expect(page.getByText('Deeply nested reply')).toBeHidden();
    await expect(page.getByText('Top level comment')).toBeVisible();

    await nestedToggle.click();

    await expect(nestedToggle).toHaveText('[-]');
    await expect(page.getByText('Nested reply', { exact: true })).toBeVisible();
    await expect(page.getByText('Deeply nested reply')).toBeVisible();

    const topToggle = page.locator('.comment-list > li > .comment > .meta > .collapse').first();
    await topToggle.click();

    await expect(page.getByText('Top level comment')).toBeHidden();
    await expect(page.getByText('Nested reply', { exact: true })).toBeHidden();
});

test('a poll item renders its poll bars', async ({ page }) => {
    await page.goto(`/item/${POLL_ID}`);

    await expect(page.getByRole('link', { name: /which framework do you prefer/ }).first()).toBeVisible();

    const pollOptions = page.locator('.pollContent');
    await expect(pollOptions).toHaveCount(2);
    await expect(pollOptions.first()).toContainText('React');
    await expect(pollOptions.first()).toContainText('150 points');
    await expect(pollOptions.nth(1)).toContainText('Angular');

    const bars = page.getByTestId('poll-bar');
    await expect(bars).toHaveCount(2);
    await expect(bars.first()).toHaveAttribute('style', 'width: 75%;');
    await expect(bars.nth(1)).toHaveAttribute('style', 'width: 25%;');
});
