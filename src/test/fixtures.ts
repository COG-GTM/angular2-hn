import type { Comment } from '../app/shared/models/comment';
import type { Story } from '../app/shared/models/story';
import type { User } from '../app/shared/models/user';

export function makeStory(overrides: Partial<Story> = {}): Story {
  return {
    id: 1,
    title: 'A story',
    points: 42,
    user: 'pg',
    time: 1700000000,
    time_ago: '2 hours ago',
    type: 'story',
    url: 'https://example.com/story',
    domain: 'example.com',
    comments: [],
    comments_count: 3,
    ...overrides,
  };
}

export function makeFeed(count: number, overrides: Partial<Story> = {}): Story[] {
  return Array.from({ length: count }, (_, i) =>
    makeStory({ id: i + 1, title: `Story ${i + 1}`, ...overrides })
  );
}

export function makeComment(overrides: Partial<Comment> = {}): Comment {
  return {
    id: 100,
    level: 0,
    user: 'alice',
    time: 1700000000,
    time_ago: '1 hour ago',
    content: '<p>Top level comment</p>',
    comments: [],
    ...overrides,
  };
}

export const user: User = {
  id: 'pg',
  created_time: 1160418092,
  created: '20 years ago',
  karma: 157316,
  about: 'Bug fixer.',
};
