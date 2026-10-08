import type { Comment, Story, User } from '../shared/models';

export function makeStory(overrides: Partial<Story> = {}): Story {
    return {
        id: 1,
        title: 'Example story',
        points: 42,
        user: 'pg',
        time: 1700000000,
        time_ago: '2 hours ago',
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

export function makeComment(overrides: Partial<Comment> = {}): Comment {
    return {
        id: 100,
        level: 0,
        user: 'dang',
        time: 1700000000,
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
        crated_time: 1160418092,
        created: '18 years ago',
        karma: 155000,
        avg: 0,
        about: 'Bug fixer.',
        ...overrides,
    };
}
