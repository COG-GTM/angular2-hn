import { test as base, expect, type Page } from '@playwright/test';

const API = 'https://node-hnapi.herokuapp.com';

function story(id: number, overrides: Record<string, unknown> = {}) {
    return {
        id,
        title: `Story ${id}`,
        points: 100 + id,
        user: `user${id}`,
        time: 1600000000,
        time_ago: '2 hours ago',
        type: 'link',
        url: `https://example.com/${id}`,
        domain: 'example.com',
        comments: [],
        comments_count: 2,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
    };
}

export const feedFixture = (feedType: string) => [story(1), story(2), story(3)].map((s) => ({ ...s, title: `${feedType} story ${s.id}` }));

export const itemFixture = {
    ...story(1),
    title: 'Story 1',
    content: '<p>Item body</p>',
    comments_count: 2,
    comments: [
        {
            id: 11,
            level: 0,
            user: 'commenter',
            time: 1600000000,
            time_ago: '1 hour ago',
            content: '<p>Top level comment</p>',
            deleted: false,
            comments: [
                {
                    id: 12,
                    level: 1,
                    user: 'replier',
                    time: 1600000001,
                    time_ago: '30 minutes ago',
                    content: '<p>Nested reply</p>',
                    deleted: false,
                    comments: [],
                },
            ],
        },
    ],
};

export const userFixture = {
    id: 'user1',
    crated_time: 1600000000,
    created: 'October 1, 2020',
    karma: 4321,
    avg: 1,
    about: '<p>About the user</p>',
};

export async function mockApi(page: Page) {
    await page.route(`${API}/**`, async (route) => {
        const path = new URL(route.request().url()).pathname;
        const feedMatch = /^\/(news|newest|show|ask|jobs)$/.exec(path);

        if (feedMatch) {
            await route.fulfill({ json: feedFixture(feedMatch[1]) });
            return;
        }

        if (path.startsWith('/item/')) {
            await route.fulfill({ json: itemFixture });
            return;
        }

        if (path.startsWith('/user/')) {
            await route.fulfill({ json: userFixture });
            return;
        }

        await route.fulfill({ status: 404, json: {} });
    });
}

export const test = base.extend({
    page: async ({ page }, use) => {
        await mockApi(page);
        await use(page);
    },
});

export { expect };
