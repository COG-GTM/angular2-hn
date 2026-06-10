/**
 * Deterministic Hacker News API fixtures.
 *
 * Both the Angular and React apps fetch from the same upstream
 * (`node-hnapi.herokuapp.com`). For cross-app parity to be meaningful the two
 * apps must render *identical* content, otherwise live-data drift dominates the
 * pixel diff. These fixtures are served via Playwright request interception so
 * both apps see byte-identical responses.
 */

export const STORY_ID = 8863;
export const POLL_ID = 126809;
export const USER_ID = 'parityuser';
export const INVALID_ID = 99999999;

export const FEED_PAGE_SIZE = 30;

export interface FixtureComment {
    id: number;
    level: number;
    user: string;
    time: number;
    time_ago: string;
    content: string;
    deleted: boolean;
    comments: FixtureComment[];
}

function story(i: number) {
    return {
        id: 1000 + i,
        title: `Parity Test Story ${i}`,
        points: 100 + i,
        user: `user${i}`,
        time: 1700000000,
        time_ago: `${i} hour${i === 1 ? '' : 's'} ago`,
        type: 'link',
        url: `https://example.com/article-${i}`,
        domain: 'example.com',
        comments_count: i,
        comments: [],
    };
}

function job(i: number) {
    return {
        id: 2000 + i,
        title: `Parity Test Job ${i}`,
        points: null,
        user: null,
        time: 1700000000,
        time_ago: `${i} hour${i === 1 ? '' : 's'} ago`,
        type: 'job',
        url: `https://example.com/job-${i}`,
        domain: 'example.com',
        comments_count: 0,
        comments: [],
    };
}

export function feedFixture(count = FEED_PAGE_SIZE) {
    return Array.from({ length: count }, (_, idx) => story(idx + 1));
}

export function jobsFixture(count = FEED_PAGE_SIZE) {
    return Array.from({ length: count }, (_, idx) => job(idx + 1));
}

export function storyFixture() {
    const comments: FixtureComment[] = [
        {
            id: 1,
            level: 0,
            user: 'alice',
            time: 1700000001,
            time_ago: '4 hours ago',
            content: '<p>Top level comment from alice.</p>',
            deleted: false,
            comments: [
                {
                    id: 2,
                    level: 1,
                    user: 'bob',
                    time: 1700000002,
                    time_ago: '3 hours ago',
                    content: '<p>Nested reply from bob.</p>',
                    deleted: false,
                    comments: [],
                },
            ],
        },
        {
            id: 3,
            level: 0,
            user: 'carol',
            time: 1700000003,
            time_ago: '2 hours ago',
            content: '<p>Another top level comment.</p>',
            deleted: false,
            comments: [],
        },
    ];

    return {
        id: STORY_ID,
        title: 'Parity Test: Story With Comments',
        points: 256,
        user: 'storyauthor',
        time: 1700000000,
        time_ago: '5 hours ago',
        type: 'link',
        url: 'https://example.com/story',
        domain: 'example.com',
        comments_count: 3,
        content: '',
        comments,
    };
}

export function pollFixture() {
    return {
        id: POLL_ID,
        title: 'Parity Test: Poll',
        points: 50,
        user: 'pollauthor',
        time: 1700000000,
        time_ago: '6 hours ago',
        type: 'poll',
        url: '',
        domain: '',
        comments_count: 0,
        content: '<p>Poll description for parity testing.</p>',
        // length drives how many poll-option sub-items the apps fetch
        poll: [
            { points: 0, content: '' },
            { points: 0, content: '' },
            { points: 0, content: '' },
        ],
        comments: [],
    };
}

export function pollOptionFixture(optionIndex: number) {
    const points = [30, 20, 10][optionIndex - 1] ?? 5;
    return { points, content: `<p>Poll option ${optionIndex}</p>` };
}

export function userFixture() {
    return {
        id: USER_ID,
        crated_time: 1161172800,
        created: 'October 18, 2006',
        karma: 12345,
        avg: 5,
        about: '<p>This is the about section for the parity test user.</p>',
    };
}
