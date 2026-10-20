import type { Comment as CommentModel, Story } from '../../shared/models';

export function makeComment(overrides: Partial<CommentModel> = {}): CommentModel {
    return {
        id: 101,
        level: 0,
        user: 'alice',
        time: 1_700_000_000,
        time_ago: '2 hours ago',
        content: '<p>Top level comment</p>',
        comments: [],
        ...overrides,
    };
}

export function makeStory(overrides: Partial<Story> = {}): Story {
    return {
        id: 1,
        title: 'A great story',
        points: 42,
        user: 'pg',
        time: 1_700_000_000,
        time_ago: '3 hours ago',
        type: 'link',
        url: 'https://example.com/story',
        domain: 'example.com',
        comments: [],
        comments_count: 0,
        content: '',
        ...overrides,
    };
}
