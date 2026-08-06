import { Page } from '@playwright/test';

const API = 'https://node-hnapi.herokuapp.com';

export function feedStories(feedType: string, page: number, count = 30) {
    return Array.from({ length: count }, (_, index) => ({
        id: page * 1000 + index,
        title: `${feedType} story ${index + 1} (page ${page})`,
        points: 10 + index,
        user: `user${index}`,
        time: 1600000000,
        time_ago: `${index + 1} hours ago`,
        type: 'story',
        url: `https://example.com/${feedType}/${index}`,
        domain: 'example.com',
        comments_count: index,
    }));
}

export const itemWithComments = {
    id: 42,
    title: 'An item with comments',
    points: 123,
    user: 'author',
    time: 1600000000,
    time_ago: '3 hours ago',
    type: 'story',
    url: 'https://example.com/an-item',
    domain: 'example.com',
    content: '<p>Item body</p>',
    comments_count: 2,
    comments: [
        {
            id: 1,
            level: 0,
            user: 'commenter',
            time: 1600000001,
            time_ago: '2 hours ago',
            content: '<p>A top level comment</p>',
            comments: [
                {
                    id: 2,
                    level: 1,
                    user: 'replier',
                    time: 1600000002,
                    time_ago: '1 hour ago',
                    content: '<p>A nested reply</p>',
                    comments: [],
                },
            ],
        },
    ],
};

export const user = {
    id: 'author',
    created: 'October 22, 2010',
    karma: 4321,
    about: '<p>All about the author</p>',
};

/**
 * Serves deterministic fixtures for every Hacker News API call so the e2e run
 * never depends on the live API.
 */
export async function mockHackerNewsApi(page: Page) {
    await page.route(`${API}/**`, async (route) => {
        const url = new URL(route.request().url());
        const [, resource, id] = url.pathname.split('/');
        const pageNumber = Number(url.searchParams.get('page') ?? '1');

        if (resource === 'item') {
            await route.fulfill({ json: { ...itemWithComments, id: Number(id) } });
            return;
        }

        if (resource === 'user') {
            await route.fulfill({ json: { ...user, id: String(id) } });
            return;
        }

        await route.fulfill({ json: feedStories(resource, pageNumber) });
    });
}
