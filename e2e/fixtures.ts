import type { Page } from '@playwright/test';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

export function story(id: number, overrides: Record<string, unknown> = {}) {
    return {
        id,
        title: `Story ${id}`,
        points: 10 + id,
        user: 'pg',
        time: 1_580_000_000,
        time_ago: '2 hours ago',
        type: 'story',
        url: `https://example.com/${id}`,
        domain: 'example.com',
        content: '',
        comments: [],
        comments_count: 2,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
        ...overrides,
    };
}

/** Serves the Hacker News API from fixtures so the suite never depends on the live API. */
export async function mockHackerNewsApi(page: Page): Promise<void> {
    await page.route(`${BASE_URL}/**`, async (route) => {
        const { pathname, searchParams } = new URL(route.request().url());
        const page_ = Number(searchParams.get('page') ?? 1);

        if (pathname === '/item/100') {
            return route.fulfill({
                json: story(100, {
                    title: 'Story with discussion',
                    url: 'item?id=100',
                    content: '<p>The submitted text</p>',
                    comments: [
                        {
                            id: 1,
                            level: 0,
                            user: 'dang',
                            time: 1_580_000_000,
                            time_ago: '1 hour ago',
                            content: '<p>A top level comment</p>',
                            deleted: false,
                            comments: [
                                {
                                    id: 2,
                                    level: 1,
                                    user: 'tptacek',
                                    time: 1_580_000_000,
                                    time_ago: '30 minutes ago',
                                    content: '<p>A nested reply</p>',
                                    deleted: false,
                                    comments: [],
                                },
                            ],
                        },
                    ],
                }),
            });
        }

        if (pathname === '/user/pg') {
            return route.fulfill({
                json: {
                    id: 'pg',
                    created_time: 1_160_000_000,
                    created: 'October 2006',
                    karma: 155_000,
                    avg: 0,
                    about: '<p>Bug fixer.</p>',
                },
            });
        }

        const feedStart = (page_ - 1) * 30 + 100;

        return route.fulfill({
            json: Array.from({ length: 30 }, (_unused, index) =>
                index === 0 && page_ === 1
                    ? story(100, { title: 'Story with discussion', url: 'item?id=100', domain: '' })
                    : story(feedStart + index)
            ),
        });
    });
}
