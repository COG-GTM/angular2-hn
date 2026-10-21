import { test as base, type Page } from '@playwright/test';

import type { Comment, FeedType, Story, User } from '../src/models';

const API = 'https://node-hnapi.herokuapp.com';

export function story(id: number, overrides: Partial<Story> = {}): Story {
  return {
    id,
    title: `Story ${id}`,
    points: 100 + id,
    user: 'pg',
    time: 1792590000,
    time_ago: '2 hours ago',
    content: '',
    comments: [],
    comments_count: 3,
    type: 'link',
    url: `https://example.com/${id}`,
    domain: 'example.com',
    ...overrides,
  };
}

export function comment(id: number, user: string, content: string, comments: Comment[] = []): Comment {
  return { id, level: 0, user, time: 1792590000, time_ago: '1 hour ago', content, deleted: false, comments };
}

export const STORY_ID = 1001;
export const storyDetail = story(STORY_ID, {
  title: 'A story with comments',
  comments: [
    comment(2001, 'dang', '<p>Top-level comment</p>', [comment(2002, 'tptacek', '<p>Nested reply</p>')]),
    comment(2003, 'patio11', '<p>Second thread <img src="x" onerror="window.__xss=1"></p>'),
  ],
});

export const user: User = {
  id: 'pg',
  created_time: 1160418092,
  created: '19 years ago',
  karma: 157316,
  avg: 0,
  about: '<p>Bug fixer. <a href="https://paulgraham.com">paulgraham.com</a></p>',
};

/** Page `n` of a feed: 30 stories (so "More" shows) except on page 3, the last page. */
function feedPage(feedType: FeedType, page: number): Story[] {
  const count = page >= 3 ? 5 : 30;
  return Array.from({ length: count }, (_, i) => {
    const id = (page - 1) * 30 + i + 1;
    const type = feedType === 'jobs' ? 'job' : 'link';
    return story(id, { title: `${feedType} story ${id}`, type });
  });
}

/** Serves a deterministic fake node-hnapi so e2e runs never touch the network. */
export async function mockApi(page: Page) {
  await page.route(`${API}/**`, async (route) => {
    const url = new URL(route.request().url());
    const [, resource, id] = url.pathname.split('/');
    if (resource === 'item' && Number(id) === STORY_ID) return route.fulfill({ json: storyDetail });
    if (resource === 'user' && id === user.id) return route.fulfill({ json: user });
    if (resource === 'user') return route.fulfill({ status: 404, json: { error: 'Not found' } });
    if (['news', 'newest', 'show', 'ask', 'jobs'].includes(resource)) {
      const pageNum = Number(url.searchParams.get('page') ?? 1);
      return route.fulfill({ json: feedPage(resource as FeedType, pageNum) });
    }
    return route.fulfill({ status: 404, json: {} });
  });
}

export const test = base.extend<{ api: void }>({
  api: [
    async ({ page }, use) => {
      await mockApi(page);
      await use();
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';
