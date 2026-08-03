import type { Comment, Story, User } from '../app/shared/models';

export function makeStory(overrides: Partial<Story> = {}): Story {
  return {
    id: 1,
    title: 'A React story',
    points: 42,
    user: 'dan',
    time: 1580000000,
    time_ago: '2 hours ago',
    type: 'story',
    url: 'https://react.dev/blog',
    domain: 'react.dev',
    comments: [],
    comments_count: 3,
    ...overrides,
  };
}

export function makeComment(overrides: Partial<Comment> = {}): Comment {
  return {
    id: 100,
    level: 0,
    user: 'sophie',
    time: 1580000000,
    time_ago: '1 hour ago',
    content: '<p>Nice write-up</p>',
    comments: [],
    ...overrides,
  };
}

export function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'dan',
    created: 'October 25, 2013',
    karma: 1234,
    ...overrides,
  };
}

export function makeStories(count: number): Story[] {
  return Array.from({ length: count }, (_, index) =>
    makeStory({ id: index + 1, title: `Story ${index + 1}` })
  );
}
