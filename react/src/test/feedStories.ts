import type { Story } from '../shared/models';

export function makeStory(id: number, overrides: Partial<Story> = {}): Story {
    return {
        id,
        title: `Story ${id}`,
        points: 100 + id,
        user: `user${id}`,
        time: 1_700_000_000 + id,
        time_ago: '3 hours ago',
        type: 'link',
        url: `https://example.com/${id}`,
        domain: 'example.com',
        comments_count: id,
        ...overrides,
    };
}

export function makeStories(count: number, firstId = 1, overrides: Partial<Story> = {}): Story[] {
    return Array.from({ length: count }, (_, i) => makeStory(firstId + i, overrides));
}
