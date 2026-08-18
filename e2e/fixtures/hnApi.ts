import type { Page } from '@playwright/test';
import type { Comment, PollResult, Story, User } from '../../src/models';

export const API_GLOB = '**/node-hnapi.herokuapp.com/**';

export const POLL_ID = 200;
export const STORY_ID = 100;
export const USER_ID = 'testuser';

function makeStory(feedType: string, pageNumber: number, index: number): Story {
    const position = (pageNumber - 1) * 30 + index + 1;
    const isJob = feedType === 'jobs';

    return {
        id: pageNumber * 1000 + index,
        title: `${feedType} story ${position}`,
        points: isJob ? 0 : 100 + index,
        user: isJob ? '' : `${feedType}-author-${index}`,
        time: 1600000000,
        time_ago: `${index + 1} hours ago`,
        type: isJob ? 'job' : 'story',
        url: `https://example.com/${feedType}/${position}`,
        domain: 'example.com',
        comments: [],
        comments_count: isJob ? 0 : index,
    };
}

export function makeFeed(feedType: string, pageNumber: number): Story[] {
    const size = pageNumber === 1 ? 30 : 10;
    return Array.from({ length: size }, (_unused, index) => makeStory(feedType, pageNumber, index));
}

function makeComment(id: number, user: string, content: string, comments: Comment[] = []): Comment {
    return {
        id,
        level: 0,
        user,
        time: 1600000000,
        time_ago: '2 hours ago',
        content,
        comments,
    };
}

export function makeStoryItem(): Story {
    return {
        id: STORY_ID,
        title: 'Ask HN: what is your favourite test runner?',
        points: 321,
        user: 'story-author',
        time: 1600000000,
        time_ago: '3 hours ago',
        type: 'story',
        url: `item?id=${STORY_ID}`,
        domain: '',
        content: '<p>Story body text</p>',
        comments_count: 3,
        comments: [
            makeComment(101, 'top-commenter', '<p>Top level comment</p>', [
                makeComment(102, 'nested-commenter', '<p>Nested reply</p>', [
                    makeComment(103, 'deep-commenter', '<p>Deeply nested reply</p>'),
                ]),
            ]),
        ],
    };
}

export function makePollItem(): Story {
    return {
        id: POLL_ID,
        title: 'Poll: which framework do you prefer?',
        points: 210,
        user: 'poll-author',
        time: 1600000000,
        time_ago: '5 hours ago',
        type: 'poll',
        url: `item?id=${POLL_ID}`,
        domain: '',
        content: '<p>Vote below</p>',
        comments_count: 0,
        comments: [],
        poll: [
            { points: 0, content: '' },
            { points: 0, content: '' },
        ],
    };
}

const pollOptions: Record<number, PollResult> = {
    [POLL_ID + 1]: { points: 150, content: '<p>React</p>' },
    [POLL_ID + 2]: { points: 50, content: '<p>Angular</p>' },
};

export function makeUser(id: string): User {
    return {
        id,
        created: '10 years ago',
        karma: 4242,
        about: '<p>Just a test user</p>',
    };
}

/**
 * Intercepts every Hacker News API call so the suite never depends on the
 * (frequently unavailable) public node-hnapi service.
 */
export async function stubHackerNewsApi(page: Page): Promise<void> {
    await page.route(API_GLOB, async (route) => {
        const url = new URL(route.request().url());
        const [resource, identifier] = url.pathname.replace(/^\//, '').split('/');
        const pageNumber = Number(url.searchParams.get('page') ?? '1');

        const json = (body: unknown) => route.fulfill({ json: body });

        switch (resource) {
            case 'news':
            case 'newest':
            case 'show':
            case 'ask':
            case 'jobs':
                return json(makeFeed(resource, pageNumber));
            case 'item': {
                const id = Number(identifier);
                if (id === POLL_ID) {
                    return json(makePollItem());
                }
                const pollOption = pollOptions[id];
                if (pollOption) {
                    return json(pollOption);
                }
                return json(makeStoryItem());
            }
            case 'user':
                return json(makeUser(identifier));
            default:
                return route.fulfill({ status: 404, json: {} });
        }
    });
}
