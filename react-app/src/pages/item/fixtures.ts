import type { Comment, Story } from '../../types';

export function makeComment(overrides: Partial<Comment> = {}): Comment {
    return {
        id: 1,
        level: 0,
        user: 'alice',
        time: 0,
        time_ago: '2 hours ago',
        content: '<p>Hello</p>',
        comments: [],
        ...overrides,
    };
}

export function makeStory(overrides: Partial<Story> = {}): Story {
    return {
        id: 42,
        title: 'A story',
        points: 10,
        user: 'pg',
        time: 0,
        time_ago: '3 hours ago',
        type: 'link',
        url: 'https://example.com/post',
        domain: 'example.com',
        comments: [],
        comments_count: 0,
        content: '',
        ...overrides,
    };
}
