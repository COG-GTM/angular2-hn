import type { Story } from '../shared/models/story';

export function makeStory(overrides: Partial<Story> = {}): Story {
    return {
        id: 1,
        title: 'A story',
        points: 42,
        user: 'pg',
        time: 0,
        time_ago: '2 hours ago',
        type: 'story',
        url: 'https://example.com/a',
        domain: 'example.com',
        comments: [],
        comments_count: 3,
        ...overrides,
    };
}
