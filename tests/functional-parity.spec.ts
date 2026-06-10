import { test, expect } from '@playwright/test';
import {
    mockApi,
    gotoAndWait,
    stabilize,
    setTheme,
    setNumberSetting,
    setOpenLinksInNewTab,
    openSettings,
    closeSettings,
    getThemeClass,
    STORY_ID,
} from './helpers';

/**
 * Functional / behavioural parity (Phase 12f).
 *
 * Each behaviour is asserted independently against both the `angular` and
 * `react` projects, so a behaviour that regresses in one app fails there only.
 */

test.beforeEach(async ({ page }) => {
    await mockApi(page);
});

test('settings persist across reload via localStorage', async ({ page }) => {
    await gotoAndWait(page, '/news/1');

    await setTheme(page, 'night');
    await setNumberSetting(page, 'font', '20');
    await setNumberSetting(page, 'spacing', '5');
    await setOpenLinksInNewTab(page, true);
    await closeSettings(page);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('.loading-section').first().waitFor({ state: 'detached' }).catch(() => undefined);
    await stabilize(page);

    expect(await getThemeClass(page)).toMatch(/night/);

    await openSettings(page);
    await expect(page.locator('#popup1 input[type="number"]').nth(0)).toHaveValue('20');
    await expect(page.locator('#popup1 input[type="number"]').nth(1)).toHaveValue('5');
    await expect(page.locator('#popup1 input[type="checkbox"]').first()).toBeChecked();
});

test('pagination moves between pages', async ({ page }) => {
    await gotoAndWait(page, '/news/1');

    await page.locator('.nav .more').click();
    await page.waitForURL(/\/news\/2$/);
    await expect(page.locator('ol')).toHaveAttribute('start', '31');

    await page.locator('.nav .prev').click();
    await page.waitForURL(/\/news\/1$/);
    await expect(page.locator('ol')).toHaveAttribute('start', '1');
});

test('header navigation loads each feed', async ({ page }) => {
    await gotoAndWait(page, '/news/1');

    const links: Array<[string, RegExp]> = [
        ['a[href="/newest/1"]', /\/newest\/1$/],
        ['a[href="/show/1"]', /\/show\/1$/],
        ['a[href="/ask/1"]', /\/ask\/1$/],
        ['a[href="/jobs/1"]', /\/jobs\/1$/],
    ];
    for (const [selector, urlRe] of links) {
        await page.locator(`.header-nav ${selector}`).click();
        await page.waitForURL(urlRe);
        await page.locator('.loading-section').first().waitFor({ state: 'detached' }).catch(() => undefined);
        await expect(page.locator('.main-content')).toBeVisible();
    }

    // Home logo returns to the news feed.
    await page.locator('.home-link').click();
    await page.waitForURL(/\/news\/1$/);
    await expect(page.locator('ol > li.post').first()).toBeVisible();
});

test('comment collapse hides content and expand restores it', async ({ page }) => {
    await gotoAndWait(page, `/item/${STORY_ID}`);
    // Scope to the first top-level comment so `.first()` stays pinned to it even
    // when React removes the collapsed content from the DOM (Angular only hides it).
    const firstComment = page.locator('.comment-list > li').first();
    const firstText = firstComment.locator('.comment-text').first();
    const toggle = firstComment.locator('.collapse').first();

    await expect(firstText).toBeVisible();
    await toggle.click();
    await expect(firstText).toBeHidden();

    await toggle.click();
    await expect(firstComment.locator('.comment-text').first()).toBeVisible();
});

test('external link target/rel toggles with the setting', async ({ page }) => {
    await gotoAndWait(page, '/news/1');
    const title = page.locator('ol > li.post .title').first();

    // Default: links open in the same tab (no target/rel).
    expect(await title.getAttribute('target')).toBeNull();
    expect(await title.getAttribute('rel')).toBeNull();

    await setOpenLinksInNewTab(page, true);
    await closeSettings(page);

    await expect(title).toHaveAttribute('target', '_blank');
    await expect(title).toHaveAttribute('rel', /noopener/);
});

test('mobile back button returns to the previous page', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await gotoAndWait(page, '/news/1');

    // Navigate into an item via the in-app comment link, then go back.
    await page.locator('ol > li.post .subtext-palm .comment-number').first().click();
    await page.waitForURL(/\/item\/\d+$/);
    await page.locator('.mobile .back-button').waitFor();

    await page.locator('.mobile .back-button').click();
    await page.waitForURL(/\/news\/1$/);
    await expect(page.locator('ol > li.post').first()).toBeVisible();
});

test('dark color-scheme auto-selects the night theme', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await gotoAndWait(page, '/news/1');
    expect(await getThemeClass(page)).toMatch(/night/);
});
