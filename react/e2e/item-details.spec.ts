import { expect, test } from '@playwright/test';
import { mockHnApi } from './support/mock-api';
import { feed, items, poll, story } from './fixtures/item-details';

function itemHandler(url: URL) {
    const id = Number(url.pathname.split('/').pop());
    return items[id] ?? {};
}

test.describe('item details', () => {
    test('opens a story from the feed and shows its comment tree', async ({ page }) => {
        await mockHnApi(page, { '/news': () => feed, '/item/': itemHandler });
        await page.goto('/news/1');
        await page.goto(`/item/${story.id}`);

        const details = page.getByTestId('item-details');
        await expect(details).toHaveAttribute('data-item-id', String(story.id));
        const header = details.locator('.laptop');
        await expect(header.getByRole('link', { name: story.title })).toHaveAttribute('href', story.url!);
        await expect(header.locator('.domain')).toHaveText('(example.com)');
        await expect(header.locator('.subtext')).toContainText('256 points by pg');
        await expect(header.locator('.subtext')).toContainText('4 comments');

        const list = details.locator('ul.comment-list');
        await expect(list.locator(':scope > li')).toHaveCount(3);
        await expect(list.getByText('Deeply nested reply')).toBeVisible();
        await expect(list.locator('.deleted-meta')).toHaveText(/\[deleted\]\s*\| Comment Deleted/);

        await page.goBack();
        await expect(page).toHaveURL(/\/news\/1$/);
    });

    test('collapses and expands comment subtrees with mouse and keyboard', async ({ page }) => {
        await mockHnApi(page, { '/item/': itemHandler });
        await page.goto(`/item/${story.id}`);

        const toggle = page.getByRole('button', { name: 'Collapse comment by alice' });
        await expect(toggle).toHaveText('[-]');
        await toggle.click();
        const expand = page.getByRole('button', { name: 'Expand comment by alice' });
        await expect(expand).toHaveText('[+]');
        await expect(page.getByText('Top-level comment')).toBeHidden();
        await expect(page.getByText('Deeply nested reply')).toBeHidden();
        await expect(page.getByText('Second top-level')).toBeVisible();

        await expand.click();
        await expect(page.getByText('Deeply nested reply')).toBeVisible();

        const nested = page.getByRole('button', { name: 'Collapse comment by bob' });
        await nested.focus();
        await page.keyboard.press('Enter');
        await expect(page.getByText('First reply')).toBeHidden();
        await expect(page.getByText('Top-level comment')).toBeVisible();
        await page.keyboard.press('Space');
        await expect(page.getByText('First reply')).toBeVisible();
    });

    test('renders poll results with proportional bars', async ({ page }) => {
        await mockHnApi(page, { '/item/': itemHandler });
        await page.goto(`/item/${poll.id}`);

        const options = page.locator('.pollContent');
        await expect(options).toHaveCount(2);
        await expect(options.nth(0)).toContainText('Tabs');
        await expect(options.nth(0).locator('.subtext')).toHaveText('30 points');
        await expect(options.nth(1)).toContainText('Spaces');
        const widths = await options
            .locator('.pollBar')
            .evaluateAll((bars) => bars.map((bar) => (bar as HTMLElement).style.width));
        expect(widths).toEqual(['75%', '25%']);
        await expect(page.locator('.laptop').getByRole('link', { name: poll.title })).toHaveAttribute(
            'href',
            `/item/${poll.id}`
        );
        await expect(page.locator('p.subject')).toHaveText('Cast your vote.');
    });

    test('mobile back button returns to the previous page', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 740 });
        await mockHnApi(page, { '/news': () => feed, '/item/': itemHandler });
        await page.goto('/news/1');
        await page.goto(`/item/${story.id}`);
        const back = page.getByRole('button', { name: 'Back' });
        await expect(back).toBeVisible();
        await expect(page.locator('.laptop')).toBeHidden();
        await back.click();
        await expect(page).toHaveURL(/\/news\/1$/);
    });

    test('shows an error when the API fails', async ({ page }) => {
        await mockHnApi(page, {});
        await page.goto('/item/999');
        await expect(page.getByRole('alert')).toContainText('Could not load item comments.');
        await expect(page.getByTestId('item-details')).toHaveAttribute('data-item-id', '999');
    });
});
