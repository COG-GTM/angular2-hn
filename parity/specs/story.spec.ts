import type { Page } from '@playwright/test';
import { expect, fixture, live, test } from '../fixtures';

type Comment = { id: number; user: string; content: string; deleted?: boolean; comments: Comment[] };
type Item = {
    id: number;
    title: string;
    points: number;
    user: string;
    domain: string;
    comments_count: number;
    comments: Comment[];
};

const ITEM_ID = 50519231;
const item = fixture<Item>(`item-${ITEM_ID}`);
const countComments = (comments: Comment[]): number =>
    comments.reduce((n, c) => n + (c.deleted ? 0 : 1) + countComments(c.comments ?? []), 0);

// First words of a comment as the browser renders its HTML.
const firstWords = (page: Page, html: string) =>
    page.evaluate((h) => {
        const el = document.createElement('div');
        el.innerHTML = h;
        return (el.firstChild?.textContent ?? el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 30);
    }, html);

test.describe('story page', () => {
    test.skip(live, 'story assertions use the recorded fixtures');

    test('opens from the comments link on the feed', async ({ page }) => {
        await page.goto('/news/1');
        const story = fixture<Item[]>('news-1').find((s) => s.id === ITEM_ID)!;
        await page.getByRole('link', { name: `${story.comments_count} comments`, exact: true }).click();
        await expect(page).toHaveURL(new RegExp(`/item/${ITEM_ID}$`));
        await expect(page.getByRole('link', { name: item.title, exact: true })).toBeVisible();
    });

    test('shows title, domain, points, author and comment count', async ({ page }) => {
        await page.goto(`/item/${ITEM_ID}`);
        await expect(page.getByRole('link', { name: item.title, exact: true })).toBeVisible();
        await expect(page.getByText(`(${item.domain})`)).toBeVisible();
        await expect(page.getByText(`${item.points} points by ${item.user}`)).toBeVisible();
        await expect(page.getByRole('link', { name: `${item.comments_count} comments`, exact: true })).toBeVisible();
    });

    test('renders the whole comment tree', async ({ page }) => {
        await page.goto(`/item/${ITEM_ID}`);
        await expect(page.getByText('[-]', { exact: true })).toHaveCount(countComments(item.comments));
        for (const comment of item.comments.filter((c) => !c.deleted)) {
            await expect(page.getByRole('link', { name: comment.user, exact: true }).first()).toBeVisible();
            await expect(page.getByText(await firstWords(page, comment.content)).first()).toBeVisible();
        }
    });

    test('collapsing a comment hides its replies, expanding shows them again', async ({ page }) => {
        const parent = item.comments.find((c) => !c.deleted && c.comments?.length)!;
        const index = item.comments.filter((c) => !c.deleted).indexOf(parent);
        await page.goto(`/item/${ITEM_ID}`);
        const reply = page.getByText(await firstWords(page, parent.comments[0].content)).first();
        await expect(reply).toBeVisible();

        // Top-level comments are the [-] toggles that are not nested in another comment.
        const toggles = page.getByText('[-]', { exact: true });
        const offset = item.comments
            .filter((c) => !c.deleted)
            .slice(0, index)
            .reduce((n, c) => n + 1 + countComments(c.comments ?? []), 0);
        await toggles.nth(offset).click();
        await expect(page.getByText('[+]', { exact: true })).toHaveCount(1);
        await expect(reply).toBeHidden();

        await page.getByText('[+]', { exact: true }).click();
        await expect(page.getByText('[+]', { exact: true })).toHaveCount(0);
        await expect(reply).toBeVisible();
    });

    test('author link opens the user profile', async ({ page }) => {
        await page.goto(`/item/${ITEM_ID}`);
        await page.getByText(`${item.points} points by`).getByRole('link', { name: item.user, exact: true }).click();
        await expect(page).toHaveURL(new RegExp(`/user/${item.user}$`));
        await expect(page.getByText(`Created ${fixture(`user-${item.user}`).created}`)).toBeVisible();
    });
});
