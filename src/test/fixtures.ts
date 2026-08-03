import type { Comment, Story, User } from '../types';

export function makeStory(overrides: Partial<Story> = {}): Story {
    return {
        id: 100,
        title: 'A linked story',
        points: 42,
        user: 'pg',
        time: 1_580_000_000,
        time_ago: '2 hours ago',
        type: 'story',
        url: 'https://example.com/post',
        domain: 'example.com',
        content: '',
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
        id: 200,
        level: 0,
        user: 'patio11',
        time: 1_580_000_000,
        time_ago: '1 hour ago',
        content: '<p>A comment</p>',
        deleted: false,
        comments: [],
        ...overrides,
    };
}

export function makeUser(overrides: Partial<User> = {}): User {
    return {
        id: 'pg',
        created_time: 1_160_000_000,
        created: 'October 2006',
        karma: 155_000,
        avg: 0,
        about: '<p>Bug fixer.</p>',
        ...overrides,
    };
}
