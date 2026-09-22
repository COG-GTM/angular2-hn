import type { Comment, Story, User } from '../models';

export function makeStory(overrides: Partial<Story> = {}): Story {
  return {
    id: 1,
    title: 'A linked story',
    points: 42,
    user: 'pg',
    time: 1600000000,
    time_ago: '2 hours ago',
    type: 'story',
    url: 'https://example.com/post',
    domain: 'example.com',
    comments: [],
    comments_count: 3,
    ...overrides,
  };
}

export function makeComment(overrides: Partial<Comment> = {}): Comment {
  return {
    id: 10,
    level: 0,
    user: 'alice',
    time: 1600000000,
    time_ago: '1 hour ago',
    content: '<p>Top level comment</p>',
    comments: [],
    ...overrides,
  };
}

export function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'pg',
    created_time: 1160418092,
    created: 'October 9, 2006',
    karma: 155111,
    avg: 6.15,
    about: '<p>Bug fixer.</p>',
    ...overrides,
  };
}
