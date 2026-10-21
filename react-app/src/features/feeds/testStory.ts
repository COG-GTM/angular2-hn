import type { Story } from '../../models';

export function testStory(overrides: Partial<Story> = {}): Story {
  const id = overrides.id ?? 42;
  return {
    id,
    title: `Story ${id}`,
    points: 120,
    user: 'pg',
    time: 0,
    time_ago: '3 hours ago',
    type: 'link',
    url: `https://example.com/${id}`,
    domain: 'example.com',
    comments: [],
    comments_count: 7,
    ...overrides,
  };
}
