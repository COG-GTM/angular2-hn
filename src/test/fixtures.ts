import { Story } from '../types/story';
import { User } from '../types/user';
import { Comment } from '../types/comment';

export function makeStory(overrides: Partial<Story> = {}): Story {
    return {
        id: 1,
        title: 'Test title',
        points: 42,
        user: 'alice',
        time: 1600000000,
        time_ago: '2 hours ago',
        type: 'story',
        url: 'https://example.com/article',
        domain: 'example.com',
        comments: [],
        comments_count: 5,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
        ...overrides,
    };
}

export function makeUser(overrides: Partial<User> = {}): User {
    return {
        id: 'alice',
        crated_time: 1500000000,
        created: '5 years ago',
        karma: 1234,
        avg: 0,
        about: '',
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
        content: '<p>A comment</p>',
        deleted: false,
        comments: [],
        ...overrides,
    };
}
