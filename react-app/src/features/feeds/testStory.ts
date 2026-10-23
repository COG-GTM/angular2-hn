import type { Story } from '../../types';

/** A feed story as node-hnapi sends it; override any field per test. */
export function testStory(overrides: Partial<Story> = {}): Story {
    return {
        id: 101,
        title: 'A story',
        points: 42,
        user: 'pg',
        time: 1_700_000_000,
        time_ago: '3 hours ago',
        type: 'link',
        url: 'https://example.com/post',
        domain: 'example.com',
        comments: [],
        comments_count: 5,
        ...overrides,
    };
}

export function testStories(count: number, firstId = 1): Story[] {
    return Array.from({ length: count }, (_, i) => testStory({ id: firstId + i, title: `Story ${firstId + i}` }));
}
