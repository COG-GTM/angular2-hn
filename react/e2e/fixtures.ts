import type { Page, Route } from '@playwright/test';

import type { Comment, Story, User } from '../src/shared/models';

function makeComment(overrides: Partial<Comment> = {}): Comment {
    return {
        id: 10,
        level: 0,
        user: 'alice',
        time: 0,
        time_ago: '1 hour ago',
        content: 'Top-level comment',
        deleted: false,
        comments: [],
        ...overrides,
    };
}

export function makeStories(count: number, offset: number): Story[] {
    return Array.from({ length: count }, (_, index) => {
        const id = offset + index + 1;

        return {
            id,
            title: `Story ${id}`,
            points: 10,
            user: 'alice',
            time: 0,
            time_ago: '1 hour ago' as unknown as number,
            type: 'story',
            url: `https://example.com/story/${id}`,
            domain: 'example.com',
            comments: [],
            comments_count: 2,
            poll: [],
            poll_votes_count: 0,
            deleted: false,
            dead: false,
        };
    });
}

export const itemFixture: Story & { content: string } = {
    ...makeStories(1, 0)[0],
    title: 'Story 1',
    content: '<p>Item body</p>',
    comments: [
        makeComment({
            id: 10,
            comments: [makeComment({ id: 11, level: 1, user: 'bob', content: 'Nested comment' })],
        }),
        makeComment({ id: 12, user: 'carol', content: '', deleted: true }),
    ],
    comments_count: 2,
};

export const userFixture: User = {
    id: 'pg',
    crated_time: 0,
    created: '3 years ago',
    karma: 12345,
    avg: 4.5,
    about: '<p><strong>Profile about</strong></p>',
};

async function fulfillJson(route: Route, body: unknown) {
    await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify(body),
    });
}

export async function installApiMocks(page: Page) {
    await page.route('**/node-hnapi.herokuapp.com/**', async (route) => {
        const url = new URL(route.request().url());
        const pageNumber = Number(url.searchParams.get('page') ?? '1');

        if (url.pathname === '/item/1') {
            await fulfillJson(route, itemFixture);
            return;
        }

        if (url.pathname === '/user/pg') {
            await fulfillJson(route, userFixture);
            return;
        }

        const feedType = url.pathname.slice(1);
        if (['news', 'newest', 'show', 'ask', 'jobs'].includes(feedType)) {
            await fulfillJson(route, makeStories(pageNumber >= 3 ? 29 : 30, (pageNumber - 1) * 30));
            return;
        }

        await route.continue();
    });
}
