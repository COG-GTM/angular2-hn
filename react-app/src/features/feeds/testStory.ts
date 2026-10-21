import type { Story } from '../../shared/models';

/** A node-hnapi feed entry; override fields per test. */
export function testStory(overrides: Partial<Story> = {}): Story {
    return {
        id: 101,
        title: 'Show HN: A thing',
        points: 120,
        user: 'pg',
        time: 1700000000,
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
    return Array.from({ length: count }, (_, i) =>
        testStory({ id: firstId + i, title: `Story ${firstId + i}`, user: `user${firstId + i}` })
    );
}
