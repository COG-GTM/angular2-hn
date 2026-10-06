import { expect, test } from '@playwright/test';
import { ITEM, mockApi } from './mockApi';

test.use({ serviceWorkers: 'allow' });

test('reloads previously visited pages while offline', async ({ context, page }) => {
    await mockApi(context);
    await page.goto('/news/1');
    await page.evaluate(async () => {
        await navigator.serviceWorker.ready;
    });
    await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);

    await page.reload();
    await expect(page.getByRole('link', { name: 'news story 1', exact: true })).toBeVisible();
    await page.goto(`/item/${ITEM.id}`);
    await expect(page.getByText('Top level comment')).toBeVisible();

    // setOffline() does not cover requests made by the service worker, so also fail every network request.
    await context.unrouteAll();
    await context.route('**/*', (route) => route.abort('internetdisconnected'));
    await context.setOffline(true);

    await page.goto('/news/1');
    await expect(page.getByRole('link', { name: 'news story 1', exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('link', { name: 'news story 1', exact: true })).toBeVisible();

    await page.goto(`/item/${ITEM.id}`);
    await expect(page.getByText('Top level comment')).toBeVisible();

    await page.goto('/ask/3');
    await expect(page.locator('#header')).toBeVisible();
    await expect(page.getByText('Could not load ask stories.')).toBeVisible();
});
