import { test, expect, fixture, snap, commentLabel, countComments, MOBILE } from './support';

const STORY = 50614249;
const ASK = 50601706;
const POLL = 126809;

test('story item shows header, subtext and the full comment tree', async ({ page }, testInfo) => {
  const item = fixture(`item-${STORY}`);
  await page.goto(`/item/${STORY}`);
  const header = page.locator('.laptop');
  await expect(header.locator('a.title')).toHaveText(item.title);
  await expect(header.locator('a.title')).toHaveAttribute('href', item.url);
  await expect(header.locator('.domain')).toHaveText(`(${item.domain})`);
  await expect(header.locator('.subtext')).toContainText(`${item.points} points by ${item.user}`);
  await expect(header.locator('.subtext')).toContainText(commentLabel(item.comments_count));
  await expect(page.locator('ul.comment-list > li')).toHaveCount(item.comments.length);
  const live = (function count(cs: any[]): number {
    return cs.reduce((n, c) => n + 1 + count(c.comments ?? []), 0);
  })(item.comments);
  await expect(page.locator('.comment-list .meta, .comment-list .deleted-meta')).toHaveCount(live);
  const firstMeta = page.locator('ul.comment-list > li').first().locator('.meta').first();
  await expect(firstMeta.locator('a')).toHaveText(item.comments[0].user);
  await expect(firstMeta.locator('.time')).toHaveText(item.comments[0].time_ago);
  expect(countComments(item.comments)).toBeGreaterThan(0);
  await snap(page, testInfo, `item-story`);
});

test('collapsing a comment hides its text and replies', async ({ page }) => {
  const item = fixture(`item-${STORY}`);
  const withReplies = item.comments.findIndex((c: any) => c.comments?.length);
  await page.goto(`/item/${STORY}`);
  const li = page.locator('ul.comment-list > li').nth(withReplies);
  const toggle = li.locator('.collapse').first();
  const text = li.locator('.comment-text').first();
  const reply = li.locator('.subtree .meta').first();
  await expect(toggle).toHaveText('[-]');
  await expect(text).toBeVisible();
  await expect(reply).toBeVisible();
  await toggle.click();
  await expect(toggle).toHaveText('[+]');
  await expect(li.locator('.meta').first()).toHaveClass(/meta-collapse/);
  await expect(text).toBeHidden();
  await expect(reply).toBeHidden();
  await toggle.click();
  await expect(toggle).toHaveText('[-]');
  await expect(text).toBeVisible();
});

test('comment author links to the user profile', async ({ page }) => {
  const item = fixture(`item-${STORY}`);
  await page.goto(`/item/${STORY}`);
  const author = page.locator('ul.comment-list > li').first().locator('.meta a').first();
  await expect(author).toHaveAttribute('href', `/user/${item.comments[0].user}`);
});

test('ask item renders its HTML content and routes the title internally', async ({ page }, testInfo) => {
  const item = fixture(`item-${ASK}`);
  await page.goto(`/item/${ASK}`);
  await expect(page.locator('.laptop a.title')).toHaveAttribute('href', `/item/${ASK}`);
  await expect(page.locator('.laptop .domain')).toHaveCount(0);
  const plain = item.content.replace(/<[^>]+>/g, '').replace(/&#x27;/g, "'").replace(/&quot;/g, '"').slice(0, 40);
  await expect(page.locator('p.subject')).toContainText(plain.split('&')[0].trim().slice(0, 20));
  await snap(page, testInfo, 'item-ask');
});

test('poll item shows every option with points and a proportional bar', async ({ page }, testInfo) => {
  const poll = fixture(`item-${POLL}`);
  const opts = [1, 2, 3].map((i) => fixture(`item-${POLL + i}`));
  const total = opts.reduce((n, o) => n + o.points, 0);
  await page.goto(`/item/${POLL}`);
  await expect(page.locator('.laptop a.title')).toHaveText(poll.title);
  const rows = page.locator('.pollResults .pollContent');
  await expect(rows).toHaveCount(3);
  for (const [i, o] of opts.entries()) {
    await expect(rows.nth(i).locator('.subtext')).toHaveText(`${o.points} points`);
    const style = await rows.nth(i).locator('.pollBar').getAttribute('style');
    const width = parseFloat(style!.match(/width:\s*([\d.]+)%/)![1]);
    expect(width).toBeCloseTo((o.points / total) * 100, 3);
  }
  await expect(rows.nth(0)).toContainText('Users would create too many');
  await snap(page, testInfo, 'item-poll');
});

test('item load failure shows the error message', async ({ page }) => {
  await page.goto('/item/1');
  await expect(page.locator('.error-section .strong')).toHaveText('Could not load item comments.');
});

test('mobile item header with back button', async ({ page }, testInfo) => {
  const item = fixture(`item-${STORY}`);
  await page.setViewportSize(MOBILE);
  await page.goto('/news/1');
  await page.goto(`/item/${STORY}`);
  await expect(page.locator('.mobile.item-header .title')).toHaveText(item.title);
  await expect(page.locator('.laptop')).toBeHidden();
  await snap(page, testInfo, 'mobile-item-story');
  await page.locator('.back-button').click();
  await expect(page).toHaveURL(/\/news\/1$/);
});
