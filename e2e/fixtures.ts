import type { Page } from '@playwright/test';

const API_HOST = 'https://node-hnapi.herokuapp.com';

export function feedStories(count: number, prefix = 'Story') {
    return Array.from({ length: count }, (_unused, index) => ({
        id: index + 1,
        title: `${prefix} ${index + 1}`,
        points: 10 + index,
        user: 'alice',
        time: 1600000000,
        time_ago: '2 hours ago',
        type: 'story',
        url: `https://example.com/${index + 1}`,
        domain: 'example.com',
        comments_count: index,
        comments: [],
    }));
}

export const itemWithComments = {
    id: 1,
    title: 'Story 1',
    points: 10,
    user: 'alice',
    time: 1600000000,
    time_ago: '2 hours ago',
    type: 'story',
    url: 'https://example.com/1',
    domain: 'example.com',
    content: '<p>The story body</p>',
    comments_count: 1,
    comments: [
        {
            id: 100,
            level: 0,
            user: 'bob',
            time: 1600000000,
            time_ago: '1 hour ago',
            content: '<p>A top level comment</p>',
            comments: [],
        },
    ],
};

export const userProfile = {
    id: 'alice',
    created: '5 years ago',
    karma: 1234,
    about: '<i>Hello there</i>',
};

/** Serves deterministic Hacker News API responses so the e2e run never hits the network. */
export async function mockHackerNewsApi(page: Page) {
    await page.route(`${API_HOST}/**`, async (route) => {
        const url = new URL(route.request().url());
        const [, resource, identifier] = url.pathname.split('/');

        if (resource === 'item') {
            return route.fulfill({ json: itemWithComments, headers: { 'access-control-allow-origin': '*' } });
        }

        if (resource === 'user') {
            return route.fulfill({
                json: { ...userProfile, id: identifier },
                headers: { 'access-control-allow-origin': '*' },
            });
        }

        const page_ = Number(url.searchParams.get('page') ?? '1');
        const count = resource === 'jobs' ? 2 : 30;
        return route.fulfill({
            json: feedStories(count, `${resource} p${page_}`),
            headers: { 'access-control-allow-origin': '*' },
        });
    });
}
