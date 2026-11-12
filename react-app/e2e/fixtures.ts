import { test as base, type BrowserContext } from '@playwright/test';

const story = (feed: string, page: number, i: number) => ({
    id: page * 1000 + i,
    title: `${feed} story ${page}-${i}`,
    points: 100 - i,
    user: 'pg',
    time: 0,
    time_ago: '1 hour ago',
    comments_count: i,
    type: feed === 'jobs' ? 'job' : 'link',
    url: `https://example.com/${feed}/${page}/${i}`,
    domain: 'example.com',
});

const item = {
    id: 42,
    title: 'Ask HN: e2e item',
    points: 10,
    user: 'pg',
    time: 0,
    time_ago: '2 hours ago',
    type: 'ask',
    url: 'item?id=42',
    content: '<p>Item body</p>',
    comments_count: 2,
    comments: [
        {
            id: 1,
            level: 0,
            user: 'alice',
            time: 0,
            time_ago: '1 hour ago',
            content: 'Parent comment',
            comments: [{ id: 2, level: 1, user: 'bob', time: 0, time_ago: '1 hour ago', content: 'Child comment', comments: [] }],
        },
    ],
};

const user = { id: 'pg', created_time: 0, created: '20 years ago', karma: 157316, about: 'Bug fixer.' };

/** Serve deterministic HN API fixtures (node-hnapi + HNPWA) for every request in the context. */
export async function mockHnApi(context: BrowserContext) {
    await context.route(/^https:\/\/(node-hnapi\.herokuapp\.com|api\.hnpwa\.com)\//, (route) => {
        const url = new URL(route.request().url());
        const feed = url.pathname.match(/^\/(news|newest|show|ask|jobs)$/);
        const json = (body: unknown, status = 200) =>
            route.fulfill({ status, json: body, headers: { 'Access-Control-Allow-Origin': '*' } });
        if (feed) {
            const page = Number(url.searchParams.get('page') ?? 1);
            return json(Array.from({ length: page >= 3 ? 10 : 30 }, (_, i) => story(feed[1], page, i)));
        }
        if (url.pathname === '/item/42') return json(item);
        if (url.pathname === '/v0/user/pg.json') return json(user);
        return route.fulfill({ status: 404, body: 'Cannot GET', headers: { 'Access-Control-Allow-Origin': '*' } });
    });
    // Keep Google Analytics out of the tests.
    await context.route(/google-analytics\.com/, (route) => route.fulfill({ status: 204, body: '' }));
}

export const test = base.extend({
    context: async ({ context }, provide) => {
        await mockHnApi(context);
        await provide(context);
    },
});

export { expect } from '@playwright/test';
