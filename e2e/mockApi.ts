import type { BrowserContext, Page } from '@playwright/test';
import type { Comment, FeedName, Story, User } from '../src/models';

export const PAGE_SIZE = 30;

export function story(feed: FeedName, rank: number, overrides: Partial<Story> = {}): Story {
    const id = (feed === 'jobs' ? 9000 : 1000) + rank;
    return {
        id,
        title: `${feed} story ${rank}`,
        points: 100 + rank,
        user: `user${rank}`,
        time: 1700000000,
        time_ago: '2 hours ago' as unknown as number,
        type: feed === 'jobs' ? 'job' : 'story',
        url: `https://example.com/${feed}/${rank}`,
        domain: 'example.com',
        comments: [],
        comments_count: rank,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
        ...overrides,
    };
}

function comment(id: number, level: number, content: string, comments: Comment[] = []): Comment {
    return {
        id,
        level,
        user: `commenter${id}`,
        time: 1700000000,
        time_ago: '1 hour ago',
        content,
        deleted: false,
        comments,
    };
}

export const ITEM: Story = story('news', 1, {
    id: 1001,
    title: 'Item with nested comments',
    comments_count: 3,
    comments: [
        comment(1, 0, '<p>Top level comment</p>', [
            comment(2, 1, '<p>Nested reply</p>', [comment(3, 2, '<p>Deep reply</p>')]),
        ]),
    ],
});

export const USER: User = {
    id: 'pg',
    crated_time: 1160418092,
    created: '19 years ago',
    karma: 157316,
    avg: 0,
    about: '<p>Bug fixer.</p>',
};

export async function mockApi(target: Page | BrowserContext): Promise<void> {
    await target.route('https://api.hnpwa.com/v0/**', async (route) => {
        const { pathname } = new URL(route.request().url());
        const feedMatch = pathname.match(/^\/v0\/(news|newest|show|ask|jobs)\/(\d+)\.json$/);
        if (feedMatch) {
            const feed = feedMatch[1] as FeedName;
            const page = Number(feedMatch[2]);
            const count = page === 1 ? PAGE_SIZE : 10;
            const start = (page - 1) * PAGE_SIZE + 1;
            return route.fulfill({ json: Array.from({ length: count }, (_, i) => story(feed, start + i)) });
        }
        const itemMatch = pathname.match(/^\/v0\/item\/(\d+)\.json$/);
        if (itemMatch) {
            const id = Number(itemMatch[1]);
            return route.fulfill({ json: id === ITEM.id ? ITEM : { ...ITEM, id, title: `Item ${id}`, comments: [] } });
        }
        const userMatch = pathname.match(/^\/v0\/user\/([^/]+)\.json$/);
        if (userMatch) {
            return route.fulfill({ json: { ...USER, id: decodeURIComponent(userMatch[1]) } });
        }
        return route.fulfill({ status: 404, json: null });
    });
}
