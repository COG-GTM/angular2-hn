import { expect, test } from '@playwright/test';

import { installApiMocks } from './fixtures';

test.describe('feeds', () => {
    for (const feedType of ['news', 'newest', 'show', 'ask', 'jobs']) {
        test(`${feedType} feed loads its API page and stories`, async ({ page }) => {
            await installApiMocks(page);
            const request = page.waitForRequest(`**/${feedType}?page=1`);

            await page.goto(`/${feedType}/1`);

            await expect(page).toHaveURL(new RegExp(`/${feedType}/1$`));
            expect((await request).url()).toContain(`/${feedType}?page=1`);
            await expect(page.getByText('Story 1').first()).toBeVisible();

            if (feedType === 'jobs') {
                await expect(
                    page.getByText(
                        /These are jobs at startups funded by Y Combinator|These are jobs at startups that were funded by Y Combinator/
                    )
                ).toBeVisible();
            }
        });
    }
});
