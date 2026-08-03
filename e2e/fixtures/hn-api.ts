import type { Page } from '@playwright/test';

export const API_HOST = 'https://node-hnapi.herokuapp.com';

interface FeedStory {
    id: number;
    title: string;
    points: number;
    user: string;
    time: number;
    time_ago: string;
    comments_count: number;
    type: string;
    url: string;
    domain: string;
}

export function makeFeed(page: number, count = 30): FeedStory[] {
    const offset = (page - 1) * 30;
    return Array.from({ length: count }, (_unused, index) => {
        const rank = offset + index + 1;
        return {
            id: 8000 + rank,
            title: `Page ${page} story ${index + 1}`,
            points: 100 + rank,
            user: `author${rank}`,
            time: 1175714200,
            time_ago: `${rank} hours ago`,
            comments_count: rank,
            type: 'link',
            url: `https://example.com/story-${rank}`,
            domain: 'example.com',
        };
    });
}

export const ITEM = {
    id: 8001,
    title: 'Page 1 story 1',
    points: 101,
    user: 'author1',
    time: 1175714200,
    time_ago: '1 hour ago',
    comments_count: 2,
    type: 'link',
    url: 'https://example.com/story-1',
    domain: 'example.com',
    content: '<p>The story body</p>',
    comments: [
        {
            id: 900,
            level: 0,
            user: 'commenter',
            time: 1175714300,
            time_ago: '30 minutes ago',
            content: '<p>A top level comment</p>',
            deleted: false,
            comments: [
                {
                    id: 901,
                    level: 1,
                    user: 'replier',
                    time: 1175714400,
                    time_ago: '10 minutes ago',
                    content: '<p>A nested reply</p>',
                    deleted: false,
                    comments: [],
                },
            ],
        },
    ],
};

export const USER = {
    id: 'author1',
    created_time: 1160418092,
    created: 'October 9, 2006',
    karma: 4321,
    avg: 0,
    about: '<p>Writes things.</p>',
};

/** Serves the Hacker News API from fixtures so the flows under test do not depend on the network. */
export async function mockHackerNewsApi(page: Page): Promise<void> {
    await page.route(`${API_HOST}/**`, async (route) => {
        const url = new URL(route.request().url());
        const json = async (body: unknown) => route.fulfill({ json: body });

        const feedMatch = url.pathname.match(/^\/(news|newest|show|ask|jobs)$/);
        if (feedMatch) {
            const pageNum = Number(url.searchParams.get('page') ?? '1');
            const isJobs = feedMatch[1] === 'jobs';
            const stories = makeFeed(pageNum, pageNum > 2 ? 5 : 30).map((story) =>
                isJobs ? { ...story, type: 'job', comments_count: 0 } : story
            );
            return json(stories);
        }

        if (url.pathname.startsWith('/item/')) {
            return json(ITEM);
        }

        if (url.pathname.startsWith('/user/')) {
            return json(USER);
        }

        return route.fulfill({ status: 404, json: {} });
    });
}
