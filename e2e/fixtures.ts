import { test as base, type Page } from '@playwright/test';

const apiPattern = /node-hnapi\.herokuapp\.com\//;

function story(id: number, overrides: Record<string, unknown> = {}) {
    return {
        id,
        title: `Story ${id}`,
        points: 100 + id,
        user: `user${id}`,
        time: 1600000000,
        time_ago: '2 hours ago',
        comments_count: 3,
        type: 'link',
        url: `https://example.com/${id}`,
        domain: 'example.com',
        ...overrides,
    };
}

function feed(feedType: string, page: number) {
    return Array.from({ length: 30 }, (_, index) => {
        const id = page * 100 + index;
        return story(id, { title: `${feedType} story ${index + 1} page ${page}` });
    });
}

const item = {
    ...story(1000, { title: 'Item under test' }),
    content: '<p>Item body text.</p>',
    comments: [
        {
            id: 1,
            level: 0,
            user: 'commenter',
            time: 1600000000,
            time_ago: '1 hour ago',
            content: '<p>Top level comment.</p>',
            deleted: false,
            comments: [
                {
                    id: 2,
                    level: 1,
                    user: 'replier',
                    time: 1600000000,
                    time_ago: '30 minutes ago',
                    content: '<p>Nested reply.</p>',
                    deleted: false,
                    comments: [],
                },
            ],
        },
    ],
};

const user = {
    id: 'commenter',
    crated_time: 1600000000,
    created: 'April 3, 2006',
    karma: 4321,
    avg: 0,
    about: '<p>About the commenter.</p>',
};

export async function mockApi(page: Page) {
    await page.route(apiPattern, async (route) => {
        const url = new URL(route.request().url());
        const [resource, id] = url.pathname.replace(/^\//, '').split('/');

        if (resource === 'item') {
            await route.fulfill({ json: { ...item, id: Number(id) } });
            return;
        }

        if (resource === 'user') {
            await route.fulfill({ json: { ...user, id } });
            return;
        }

        await route.fulfill({ json: feed(resource, Number(url.searchParams.get('page') ?? '1')) });
    });
}

export const test = base.extend<{ page: Page }>({
    page: async ({ page }, use) => {
        await mockApi(page);
        await use(page);
    },
});

export { expect } from '@playwright/test';
