import { expect, test } from './fixtures';

test.use({ serviceWorkers: 'allow' });

test('app shell and visited pages work offline after the service worker installs', async ({ page, context }) => {
    await page.goto('/news/1');
    await expect(page.getByText('news story 1-0')).toBeVisible();
    await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined));
    // Reload once so the page is controlled and API responses go through the runtime cache.
    await page.reload();
    await expect(page.getByText('news story 1-0')).toBeVisible();
    await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
    await page.goto('/item/42');
    await expect(page.getByText('Child comment')).toBeVisible();

    // Drop the API mocks too: Playwright routes would otherwise still answer while offline.
    await context.unrouteAll({ behavior: 'ignoreErrors' });
    await context.setOffline(true);

    await page.goto('/news/1');
    await expect(page.getByText('news story 1-0')).toBeVisible();
    await page.goto('/item/42');
    await expect(page.getByText('Child comment')).toBeVisible();

    // Never visited: the shell still renders, the feed shows the offline error.
    await page.goto('/show/1');
    await expect(page.locator('#header')).toBeVisible();
    await expect(page.getByText('Could not load show stories.')).toBeVisible({ timeout: 15_000 });
});
