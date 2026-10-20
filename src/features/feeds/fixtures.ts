import type { Story } from '../../shared/models';

/** A node-hnapi feed entry; override any field. */
export function makeStory(overrides: Partial<Story> = {}): Story {
    const id = overrides.id ?? 1;
    return {
        id,
        title: `Story ${id}`,
        points: 42,
        user: 'pg',
        time: 1_700_000_000,
        time_ago: '3 hours ago',
        type: 'link',
        url: `https://example.com/${id}`,
        domain: 'example.com',
        comments: [],
        comments_count: 5,
        ...overrides,
    };
}

/** `count` stories with ids `firstId…`. */
export function makeStories(count: number, firstId = 1): Story[] {
    return Array.from({ length: count }, (_, i) => makeStory({ id: firstId + i }));
}
