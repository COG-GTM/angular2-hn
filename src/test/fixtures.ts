import type { Comment, Story, User } from '../models';

export function makeStory(overrides: Partial<Story> = {}): Story {
    return {
        id: 1,
        title: 'A linked story',
        points: 42,
        user: 'alice',
        time: 1600000000,
        time_ago: '2 hours ago',
        type: 'story',
        url: 'https://example.com/story',
        domain: 'example.com',
        comments: [],
        comments_count: 3,
        ...overrides,
    };
}

export function makeComment(overrides: Partial<Comment> = {}): Comment {
    return {
        id: 10,
        level: 0,
        user: 'bob',
        time: 1600000000,
        time_ago: '1 hour ago',
        content: '<p>Nice write-up</p>',
        comments: [],
        ...overrides,
    };
}

export function makeUser(overrides: Partial<User> = {}): User {
    return {
        id: 'alice',
        created: '5 years ago',
        karma: 1234,
        ...overrides,
    };
}

export function makeFeed(count: number): Story[] {
    return Array.from({ length: count }, (_unused, index) =>
        makeStory({ id: index + 1, title: `Story ${index + 1}` })
    );
}
