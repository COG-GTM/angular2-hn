import { test, expect } from '@playwright/test';
import {
    mockApi,
    gotoAndWait,
    capture,
    setTheme,
    openSettings,
    VIEWPORTS,
    THEMES,
    ViewportName,
    STORY_ID,
    POLL_ID,
    INVALID_ID,
    USER_ID,
} from './helpers';

test.beforeEach(async ({ page }) => {
    await mockApi(page);
});

const viewports = Object.keys(VIEWPORTS) as ViewportName[];

for (const vp of viewports) {
    test.describe(`visual parity [${vp}]`, () => {
        test.beforeEach(async ({ page }) => {
            await page.setViewportSize(VIEWPORTS[vp]);
        });

        // 1. Feed (news) — captured for all three themes.
        for (const theme of THEMES) {
            test(`feed news (${theme})`, async ({ page }, testInfo) => {
                await gotoAndWait(page, '/news/1');
                if (theme !== 'default') await setTheme(page, theme);

                await expect(page.locator('ol > li.post')).toHaveCount(30);
                await expect(page.locator('ol > li.post').first().locator('.title')).toBeVisible();
                await expect(page.locator('.nav .more')).toBeVisible();

                await capture(page, testInfo, 'feed-news', theme, vp);
            });
        }

        // 2. Feed (jobs) — job items omit points/user/comment count.
        test('feed jobs', async ({ page }, testInfo) => {
            await gotoAndWait(page, '/jobs/1');

            await expect(page.locator('.job-header')).toBeVisible();
            await expect(page.locator('.job-header')).toContainText('These are jobs at startups');
            await expect(page.locator('ol > li.post')).toHaveCount(30);
            // Job rows never render the points/user ".name" detail.
            await expect(page.locator('ol > li.post .name')).toHaveCount(0);

            await capture(page, testInfo, 'feed-jobs', 'default', vp);
        });

        // 3. Feed page 2 — Prev visible and <ol start> is 31.
        test('feed page 2', async ({ page }, testInfo) => {
            await gotoAndWait(page, '/news/2');

            await expect(page.locator('.nav .prev')).toBeVisible();
            await expect(page.locator('ol')).toHaveAttribute('start', '31');

            await capture(page, testInfo, 'feed-page2', 'default', vp);
        });

        // 4. Item details (story with comments) — captured for all three themes.
        for (const theme of THEMES) {
            test(`item details story (${theme})`, async ({ page }, testInfo) => {
                await gotoAndWait(page, `/item/${STORY_ID}`);
                if (theme !== 'default') await setTheme(page, theme);

                // The title is rendered twice (mobile header + laptop block);
                // exactly one is visible depending on viewport.
                const titleSelector = vp === 'mobile' ? '.mobile .title' : '.laptop .title';
                await expect(page.locator(titleSelector).first()).toBeVisible();
                await expect(page.locator('.comment-list > li').first()).toBeVisible();
                if (vp === 'mobile') {
                    await expect(page.locator('.mobile .back-button')).toBeVisible();
                } else {
                    await expect(page.locator('.laptop .domain')).toBeVisible();
                }

                await capture(page, testInfo, 'item-story', theme, vp);
            });
        }

        // 5. Item details (poll) — percentage-width poll bars.
        test('item details poll', async ({ page }, testInfo) => {
            await gotoAndWait(page, `/item/${POLL_ID}`);
            await page.locator('.pollResults .pollBar').first().waitFor();

            const bars = page.locator('.pollResults .pollBar');
            await expect(bars).toHaveCount(3);
            const width = await bars.first().evaluate((el) => (el as HTMLElement).style.width);
            expect(width).toMatch(/%$/);

            await capture(page, testInfo, 'item-poll', 'default', vp);
        });

        // 6. Comment collapse / expand.
        test('comment collapse and expand', async ({ page }, testInfo) => {
            await gotoAndWait(page, `/item/${STORY_ID}`);
            const toggle = page.locator('.comment-list .collapse').first();
            await expect(toggle).toHaveText('[-]');

            await toggle.click();
            await expect(toggle).toHaveText('[+]');
            await capture(page, testInfo, 'comment-collapsed', 'default', vp);

            await toggle.click();
            await expect(toggle).toHaveText('[-]');
            await capture(page, testInfo, 'comment-expanded', 'default', vp);
        });

        // 7. User profile — captured for all three themes.
        for (const theme of THEMES) {
            test(`user profile (${theme})`, async ({ page }, testInfo) => {
                await gotoAndWait(page, `/user/${USER_ID}`);
                if (theme !== 'default') await setTheme(page, theme);

                // On mobile the identity moves into the mobile header; the
                // .main-details block is hidden (same CSS in both apps).
                if (vp === 'mobile') {
                    await expect(page.locator('.mobile.item-header .title-block')).toContainText('Profile:');
                    await expect(page.locator('.mobile .back-button')).toBeVisible();
                } else {
                    await expect(page.locator('.main-details .name')).toBeVisible();
                }
                await expect(page.locator('.profile .right')).toContainText('★');
                await expect(page.locator('.profile .age')).toContainText('Created');
                await expect(page.locator('.profile .other-details, .profile p')).not.toHaveCount(0);

                await capture(page, testInfo, 'user-profile', theme, vp);
            });
        }

        // 8. Settings popup — captured for all three themes.
        for (const theme of THEMES) {
            test(`settings popup (${theme})`, async ({ page }, testInfo) => {
                await gotoAndWait(page, '/news/1');
                if (theme !== 'default') await setTheme(page, theme);
                await openSettings(page);

                await expect(page.locator('#popup1.overlay')).toBeVisible();
                await expect(page.locator('#popup1 input[type="radio"]')).toHaveCount(3);
                await expect(page.locator('#popup1 input[type="number"]')).toHaveCount(2);
                await expect(page.locator('#popup1 input[type="checkbox"]')).toHaveCount(1);

                await capture(page, testInfo, 'settings', theme, vp);
            });
        }

        // 9. Error state — invalid id renders the skull graphic + message.
        test('error state', async ({ page }, testInfo) => {
            await gotoAndWait(page, `/item/${INVALID_ID}`);

            await expect(page.locator('.error-section .skull')).toBeVisible();
            await expect(page.locator('.error-section .strong')).toBeVisible();

            await capture(page, testInfo, 'error', 'default', vp);
        });

        // 10. Header active states.
        test('header active states', async ({ page }, testInfo) => {
            const routes: Array<[string, string]> = [
                ['/newest/1', 'a[href="/newest/1"]'],
                ['/show/1', 'a[href="/show/1"]'],
                ['/ask/1', 'a[href="/ask/1"]'],
                ['/jobs/1', 'a[href="/jobs/1"]'],
            ];
            for (const [route, selector] of routes) {
                await gotoAndWait(page, route);
                await expect(page.locator(`.header-nav ${selector}`)).toHaveClass(/active/);
            }
            await capture(page, testInfo, 'header-active-jobs', 'default', vp);
        });

        // 11. Footer.
        test('footer', async ({ page }, testInfo) => {
            await gotoAndWait(page, '/news/1');
            const footerLink = page.locator('#footer a');
            await expect(footerLink).toHaveAttribute('href', 'https://github.com/hdjirdeh/angular2-hn');
            await expect(page.locator('#footer')).toContainText('GitHub');

            await capture(page, testInfo, 'footer', 'default', vp);
        });
    });
}
