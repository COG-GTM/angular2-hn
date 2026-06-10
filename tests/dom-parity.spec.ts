import { test, expect } from '@playwright/test';
import { mockApi, gotoAndWait, setTheme, openSettings, THEMES, STORY_ID, USER_ID } from './helpers';

/**
 * Structural (DOM) parity assertions (Phase 12d).
 *
 * The same canonical assertions run against both the `angular` and `react`
 * projects. Both apps are fed identical mocked data, so any structural drift
 * surfaces as a failing assertion in one project but not the other.
 */

test.beforeEach(async ({ page }) => {
    await mockApi(page);
});

test('feed renders 30 list items', async ({ page }) => {
    await gotoAndWait(page, '/news/1');
    await expect(page.locator('ol > li')).toHaveCount(30);
    await expect(page.locator('ol > li.post')).toHaveCount(30);
});

test('each feed item exposes the expected structure', async ({ page }) => {
    await gotoAndWait(page, '/news/1');
    const items = page.locator('ol > li.post');
    const count = await items.count();
    expect(count).toBe(30);

    for (let i = 0; i < count; i++) {
        const li = items.nth(i);
        await expect(li.locator('.title')).toHaveCount(1);
        await expect(li.locator('.domain')).toHaveCount(1); // fixtures are external links
        await expect(li.locator('.subtext-palm')).toHaveCount(1);
        await expect(li.locator('.subtext-laptop')).toHaveCount(1);
    }

    // Comment count text follows the "N comment(s)" / "discuss" format.
    await expect(items.first().locator('.subtext-palm .comment-number')).toContainText(/comment|discuss/);
});

test('item details comment list matches comment count', async ({ page }) => {
    await gotoAndWait(page, `/item/${STORY_ID}`);
    // storyFixture has two top-level comments (alice + carol).
    await expect(page.locator('.comment-list > li')).toHaveCount(2);
});

test('nested comment subtree count matches replies', async ({ page }) => {
    await gotoAndWait(page, `/item/${STORY_ID}`);
    // The first top-level comment (alice) has exactly one reply (bob). Target
    // alice's own subtree (the first ul.subtree) and count its direct children,
    // which is robust to each app's wrapper element nesting.
    const firstComment = page.locator('.comment-list > li').first();
    await expect(firstComment.locator('ul.subtree').first().locator('> li')).toHaveCount(1);
});

test('settings exposes 3 radios, 2 number inputs, 1 checkbox', async ({ page }) => {
    await gotoAndWait(page, '/news/1');
    await openSettings(page);

    const radios = page.locator('#popup1 input[type="radio"]');
    await expect(radios).toHaveCount(3);
    for (const value of THEMES) {
        await expect(page.locator(`#popup1 input[type="radio"][value="${value}"]`)).toHaveCount(1);
    }
    await expect(page.locator('#popup1 input[type="number"]')).toHaveCount(2);
    await expect(page.locator('#popup1 input[type="checkbox"]')).toHaveCount(1);
});

test('user profile exposes name, karma and age', async ({ page }) => {
    await gotoAndWait(page, `/user/${USER_ID}`);
    await expect(page.locator('.profile .name')).toHaveCount(1);
    await expect(page.locator('.profile .right')).toHaveCount(1);
    await expect(page.locator('.profile .age')).toHaveCount(1);
});

test('wrapper carries the active theme class after switching', async ({ page }) => {
    await gotoAndWait(page, '/news/1');
    for (const theme of THEMES) {
        await setTheme(page, theme);
        const wrapper = page.locator('.body-cover').locator('xpath=..');
        await expect(wrapper).toHaveClass(new RegExp(`(^|\\s)${theme}(\\s|$)`));
    }
});
