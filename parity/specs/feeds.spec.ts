import { expect, fixture, live, test } from '../fixtures';

type Story = { id: number; title: string; points: number; user: string; comments_count: number; type: string };

const commentLabel = (n: number) => (n > 0 ? `${n} ${n === 1 ? 'comment' : 'comments'}` : 'discuss');
const stories = (page: import('@playwright/test').Page) => page.getByRole('list').first().getByRole('listitem');

test.describe('feeds', () => {
    test('root redirects to the first page of top stories', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveURL(/\/news\/1$/);
        await expect(stories(page)).toHaveCount(30);
    });

    test('news page 1 lists 30 stories with points, author and comment count', async ({ page }) => {
        await page.goto('/news/1');
        await expect(stories(page)).toHaveCount(30);
        await expect(page.getByRole('list').first()).toHaveAttribute('start', '1');
        if (live) return;

        const news = fixture<Story[]>('news-1');
        for (const [i, story] of news.entries()) {
            const item = stories(page).nth(i);
            await expect(item.getByRole('link', { name: story.title, exact: true })).toBeVisible();
            await expect(item).toContainText(`${story.points} points by ${story.user}`);
            await expect(
                item.getByRole('link', { name: commentLabel(story.comments_count), exact: true })
            ).toBeVisible();
        }
    });

    test('pagination: More goes to page 2 and Prev comes back', async ({ page }) => {
        await page.goto('/news/1');
        await expect(stories(page)).toHaveCount(30);
        await expect(page.getByRole('link', { name: '‹ Prev' })).toHaveCount(0);

        await page.getByRole('link', { name: 'More ›' }).click();
        await expect(page).toHaveURL(/\/news\/2$/);
        await expect(page.getByRole('list').first()).toHaveAttribute('start', '31');
        if (!live) {
            const [first] = fixture<Story[]>('news-2');
            await expect(stories(page).first().getByRole('link', { name: first.title, exact: true })).toBeVisible();
        }

        await page.getByRole('link', { name: '‹ Prev' }).click();
        await expect(page).toHaveURL(/\/news\/1$/);
        await expect(page.getByRole('list').first()).toHaveAttribute('start', '1');
    });

    for (const [label, feed] of [
        ['new', 'newest'],
        ['show', 'show'],
        ['ask', 'ask'],
        ['jobs', 'jobs'],
    ] as const) {
        test(`header "${label}" link opens the ${feed} feed`, async ({ page }) => {
            await page.goto('/news/1');
            await expect(stories(page)).toHaveCount(30);
            await page.getByRole('link', { name: label, exact: true }).click();
            await expect(page).toHaveURL(new RegExp(`/${feed}/1$`));
            if (live) {
                await expect(stories(page).first()).toBeVisible();
                return;
            }
            const items = fixture<Story[]>(`${feed}-1`);
            await expect(stories(page)).toHaveCount(items.length);
            await expect(stories(page).first().getByRole('link', { name: items[0].title, exact: true })).toBeVisible();
            await expect(page.getByRole('link', { name: 'More ›' })).toHaveCount(items.length === 30 ? 1 : 0);
        });
    }

    test('jobs feed shows the YC jobs header and no points or comments', async ({ page }) => {
        await page.goto('/jobs/1');
        await expect(page.getByText('These are jobs at startups that were funded by Y Combinator.')).toBeVisible();
        await expect(page.getByRole('link', { name: 'Triplebyte' })).toBeVisible();
        await expect(stories(page).first()).not.toContainText('points by');
        await expect(
            stories(page)
                .first()
                .getByRole('link', { name: /comments|discuss/ })
        ).toHaveCount(0);
    });

    test('logo link returns to top stories', async ({ page }) => {
        await page.goto('/show/1');
        await expect(stories(page).first()).toBeVisible();
        await page.getByRole('link', { name: 'Logo' }).click();
        await expect(page).toHaveURL(/\/news\/1$/);
        await expect(stories(page)).toHaveCount(30);
    });
});
