import type { Page, Route } from '@playwright/test';

export const API_HOST = 'https://node-hnapi.herokuapp.com';

interface MockStory {
    id: number;
    title: string;
    points: number | null;
    user: string | null;
    time_ago: string;
    comments_count: number;
    type: string;
    url?: string;
    domain?: string;
    content?: string;
    comments?: MockComment[];
}

interface MockComment {
    id: number;
    user: string;
    time_ago: string;
    content: string;
    comments: MockComment[];
    level: number;
    deleted?: boolean;
}

function story(index: number, feedType: string, page: number): MockStory {
    const id = page * 1000 + index;
    return {
        id,
        title: `${feedType} story ${index} (page ${page})`,
        points: 100 + index,
        user: `author${index}`,
        time_ago: `${index} hours ago`,
        comments_count: index,
        type: feedType === 'jobs' ? 'job' : 'link',
        url: `https://example.com/${feedType}/${id}`,
        domain: 'example.com',
    };
}

export function feed(feedType: string, page: number, count = 30): MockStory[] {
    return Array.from({ length: count }, (_, index) => story(index + 1, feedType, page));
}

export const ITEM: MockStory = {
    id: 1001,
    title: 'news story 1 (page 1)',
    points: 101,
    user: 'author1',
    time_ago: '1 hour ago',
    comments_count: 2,
    type: 'link',
    url: 'https://example.com/news/1001',
    domain: 'example.com',
    content: '<p>Story body paragraph.</p>',
    comments: [
        {
            id: 2001,
            user: 'commenter1',
            time_ago: '30 minutes ago',
            content: '<p>Top level comment.</p>',
            level: 0,
            comments: [
                {
                    id: 2002,
                    user: 'commenter2',
                    time_ago: '20 minutes ago',
                    content: '<p>Nested reply.</p>',
                    level: 1,
                    comments: [],
                },
            ],
        },
        {
            id: 2003,
            user: 'commenter3',
            time_ago: '10 minutes ago',
            content: '<p>Another top level comment.</p>',
            level: 0,
            comments: [],
        },
    ],
};

export const USER = {
    id: 'author1',
    created: 'October 1, 2010',
    created_time: 1285891200,
    karma: 4242,
    about: '<p>Just another Hacker News reader.</p>',
};

/**
 * Serves deterministic Hacker News API responses so the suite does not depend on
 * the upstream service (which also does not implement `/user/:id`).
 */
export async function mockApi(page: Page): Promise<void> {
    await page.route(`${API_HOST}/**`, (route: Route) => {
        const url = new URL(route.request().url());
        const [segment, id] = url.pathname.replace(/^\//, '').split('/');

        if (segment === 'item') {
            return route.fulfill({ json: { ...ITEM, id: Number(id) } });
        }

        if (segment === 'user') {
            return route.fulfill({ json: { ...USER, id } });
        }

        const pageParam = Number(url.searchParams.get('page') ?? '1');
        // The last page returns fewer than 30 stories, which hides the "More" link.
        return route.fulfill({ json: feed(segment, pageParam, pageParam >= 3 ? 12 : 30) });
    });
}
