import { test, expect } from '@playwright/test';
import { fixture, mockApi, shot, waitForFeed } from './helpers';

test.beforeEach(async ({ page }) => mockApi(page));

const STORY = 50621977;
const ASK = 50622809;
const POLL = 126809;

test('comments link opens the story with its comment tree', async ({ page }, testInfo) => {
  const story = fixture<any>(`item-${STORY}`);
  await page.goto('/news/1');
  await waitForFeed(page);
  const row = page.locator('li.post').filter({ hasText: story.title });
  await row.locator(`.subtext-laptop a[href="/item/${STORY}"]`).click();
  await expect(page).toHaveURL(new RegExp(`/item/${STORY}$`));
  const header = page.locator('.laptop.item-header');
  await expect(header.locator('a.title')).toHaveText(story.title);
  await expect(header.locator('a.title')).toHaveAttribute('href', story.url);
  await expect(header.locator('.domain')).toHaveText(`(${story.domain})`);
  await expect(header.locator('.subtext')).toContainText(`${story.points} points by ${story.user}`);
  await expect(header.locator('.subtext')).toContainText(`${story.comments_count} comments`);
  await expect(page.locator('.comment-list > li')).toHaveCount(story.comments.length);
  await expect(page.locator('app-comment')).toHaveCount(story.comments_count);
  await expect(page.locator('app-comment .meta a').first()).toHaveText(story.comments[0].user);
  await shot(page, testInfo, 'item-story');
});

test('collapsing a comment hides its text and replies', async ({ page }) => {
  const story = fixture<any>(`item-${STORY}`);
  await page.goto(`/item/${STORY}`);
  const index = story.comments.findIndex((c: any) => c.comments.length > 0);
  expect(index).toBeGreaterThanOrEqual(0);
  const parent = story.comments[index];
  const comment = page.locator('.comment-list > li').nth(index).locator('app-comment').first();
  const toggle = comment.locator('.meta .collapse').first();
  const text = comment.locator('.comment-text').first();
  const replies = comment.locator('.subtree').first().locator(':scope > li');
  const firstReply = replies.first().locator('.meta a').first();
  await expect(comment.locator('.meta a').first()).toHaveText(parent.user);
  await expect(toggle).toHaveText('[-]');
  await expect(text).toBeVisible();
  await expect(replies).toHaveCount(parent.comments.length);
  await expect(firstReply).toHaveText(parent.comments[0].user);
  await expect(firstReply).toBeVisible();
  await toggle.click();
  await expect(toggle).toHaveText('[+]');
  await expect(text).toBeHidden();
  await expect(firstReply).toBeHidden();
  await toggle.click();
  await expect(toggle).toHaveText('[-]');
  await expect(text).toBeVisible();
  await expect(firstReply).toBeVisible();
});

test('ask item without external url links to itself and shows its text', async ({ page }, testInfo) => {
  const ask = fixture<any>(`item-${ASK}`);
  await page.goto('/ask/1');
  await waitForFeed(page);
  await page.locator('li.post a.title').first().click();
  await expect(page).toHaveURL(new RegExp(`/item/${ASK}$`));
  const title = page.locator('.laptop a.title');
  await expect(title).toHaveText(ask.title);
  await expect(title).toHaveAttribute('href', `/item/${ASK}`);
  await expect(page.locator('p.subject')).toContainText(ask.content.replace(/<[^>]+>/g, '').slice(0, 40));
  await shot(page, testInfo, 'item-ask');
});

test('poll item shows options with their points', async ({ page }, testInfo) => {
  const poll = fixture<any>(`item-${POLL}`);
  await page.goto(`/item/${POLL}`);
  await expect(page.locator('.laptop a.title')).toHaveText(poll.title);
  await expect(page.locator('.pollContent')).toHaveCount(poll.poll.length);
  for (let i = 1; i <= poll.poll.length; i++) {
    const opt = fixture<any>(`item-${POLL + i}`);
    await expect(page.locator('.pollContent').nth(i - 1).locator('.subtext')).toHaveText(`${opt.points} points`);
  }
  await shot(page, testInfo, 'item-poll');
});
