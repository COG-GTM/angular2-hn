import type { Comment, PollResult, Story, User } from '../models';

export function makeStory(overrides: Partial<Story> = {}): Story {
  return {
    id: 1,
    title: 'A story about React',
    points: 42,
    user: 'alice',
    time: 1_700_000_000,
    time_ago: '2 hours ago',
    type: 'story',
    url: 'https://example.com/react',
    domain: 'example.com',
    comments: [],
    comments_count: 3,
    ...overrides,
  };
}

export function makeComment(overrides: Partial<Comment> = {}): Comment {
  return {
    id: 100,
    level: 0,
    user: 'bob',
    time: 1_700_000_100,
    time_ago: '1 hour ago',
    content: '<p>Nice post</p>',
    deleted: false,
    comments: [],
    ...overrides,
  };
}

export function makePollResult(overrides: Partial<PollResult> = {}): PollResult {
  return { points: 10, content: '<p>Option</p>', ...overrides };
}

export function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'alice',
    created_time: 1_500_000_000,
    created: '8 years ago',
    karma: 1234,
    about: '<p>Hello there</p>',
    ...overrides,
  };
}

/** A full page of feed results (30 items) so "More ›" pagination is shown. */
export function makeFeedPage(startId = 1, count = 30): Story[] {
  return Array.from({ length: count }, (_, i) => makeStory({ id: startId + i, title: `Story ${startId + i}` }));
}
