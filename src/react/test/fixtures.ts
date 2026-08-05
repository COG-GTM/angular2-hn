import { Story } from '../models/story';

export function makeStory(overrides: Partial<Story> = {}): Story {
    return {
        id: 123,
        title: 'A great story',
        points: 42,
        user: 'pg',
        time: 1600000000,
        time_ago: 3,
        type: 'story',
        url: 'https://example.com/article',
        domain: 'example.com',
        comments: [],
        comments_count: 7,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
        content: '',
        text: '',
        ...overrides,
    };
}
