import { Page } from '@playwright/test';

interface FeedStory {
    id: number;
    title: string;
    points: number;
    user: string;
    time: number;
    time_ago: string;
    type: 'story' | 'job' | 'poll';
    url: string;
    domain: string;
    comments_count: number;
}

function makeFeed(prefix: string, count: number): FeedStory[] {
    return Array.from({ length: count }, (_, i) => ({
        id: 1000 + i,
        title: `${prefix} story ${i + 1}`,
        points: 100 + i,
        user: `user${i + 1}`,
        time: 1600000000,
        time_ago: '2 hours ago',
        type: 'story',
        url: `https://example.com/${prefix}/${i + 1}`,
        domain: 'example.com',
        comments_count: i,
    }));
}

const itemDetail = {
    id: 1000,
    title: 'Detailed story title',
    points: 256,
    user: 'author',
    time: 1600000000,
    time_ago: '3 hours ago',
    type: 'story',
    url: 'https://example.com/detailed',
    domain: 'example.com',
    comments_count: 2,
    content: '<p>This is the story body content.</p>',
    comments: [
        {
            id: 2001,
            level: 0,
            user: 'commenter_one',
            time: 1600000100,
            time_ago: '2 hours ago',
            content: '<p>Top level comment</p>',
            deleted: false,
            comments: [
                {
                    id: 2002,
                    level: 1,
                    user: 'commenter_two',
                    time: 1600000200,
                    time_ago: '1 hour ago',
                    content: '<p>Nested reply comment</p>',
                    deleted: false,
                    comments: [],
                },
            ],
        },
    ],
};

const userProfile = {
    id: 'author',
    created_time: 1500000000,
    created: '7 years ago',
    karma: 4096,
    about: '<b>Hello, I am a HN user.</b>',
};

export async function installHnMocks(page: Page) {
    await page.route(/node-hnapi\.herokuapp\.com/, async (route) => {
        const url = new URL(route.request().url());
        const path = url.pathname;
        const pageParam = Number(url.searchParams.get('page') ?? '1');

        const json = async (body: unknown) =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(body),
            });

        if (path.startsWith('/item/')) {
            return json(itemDetail);
        }
        if (path.startsWith('/user/')) {
            return json(userProfile);
        }

        const feedType = path.replace('/', '');
        const knownFeeds = ['news', 'newest', 'show', 'ask', 'jobs'];
        if (knownFeeds.includes(feedType)) {
            const count = pageParam === 1 ? 30 : 5;
            return json(makeFeed(feedType, count));
        }

        return json([]);
    });
}
