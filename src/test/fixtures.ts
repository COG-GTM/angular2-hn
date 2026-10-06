import type { Comment, Story, User } from '../models';

export function makeStory(overrides: Partial<Story> = {}): Story {
    return {
        id: 1,
        title: 'A story',
        points: 42,
        user: 'alice',
        time: 0,
        time_ago: '2 hours ago' as unknown as number,
        type: 'story',
        url: 'https://example.com/post',
        domain: 'example.com',
        comments: [],
        comments_count: 3,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
        ...overrides,
    };
}

export function makeStories(count: number, overrides: Partial<Story> = {}): Story[] {
    return Array.from({ length: count }, (_, i) => makeStory({ id: i + 1, title: `Story ${i + 1}`, ...overrides }));
}

export function makeComment(overrides: Partial<Comment> = {}): Comment {
    return {
        id: 100,
        level: 0,
        user: 'bob',
        time: 0,
        time_ago: '1 hour ago',
        content: '<p>Hello</p>',
        deleted: false,
        comments: [],
        ...overrides,
    };
}

export function makeUser(overrides: Partial<User> = {}): User {
    return {
        id: 'pg',
        crated_time: 0,
        created: '19 years ago',
        karma: 157316,
        avg: 0,
        about: 'Bug fixer.',
        ...overrides,
    };
}
