import { test as base, type BrowserContext } from '@playwright/test';

/** Deterministic HN API data so e2e runs don't depend on the live (and frequently changing) API. */
export function story(id: number, overrides: Record<string, unknown> = {}) {
  return {
    id,
    title: `Story ${id}`,
    points: 100 + id,
    user: `user${id}`,
    time: 1_700_000_000,
    time_ago: '2 hours ago',
    type: 'link',
    url: `https://example.com/${id}`,
    domain: 'example.com',
    comments_count: id % 5,
    ...overrides,
  };
}

export const feedPage = (page: number, count = 30) =>
  Array.from({ length: count }, (_, i) => story((page - 1) * 30 + i + 1));

export const item = (id: number) => ({
  ...story(id),
  content: '<p>Story body</p>',
  comments: [
    {
      id: id * 10,
      level: 0,
      user: 'commenter',
      time: 1_700_000_100,
      time_ago: '1 hour ago',
      content: '<p>Top level comment</p>',
      deleted: false,
      comments: [
        {
          id: id * 10 + 1,
          level: 1,
          user: 'replier',
          time: 1_700_000_200,
          time_ago: '30 minutes ago',
          content: '<p>Nested reply</p>',
          deleted: false,
          comments: [],
        },
      ],
    },
  ],
  comments_count: 2,
});

export const user = (id: string) => ({
  id,
  created_time: 1_160_418_092,
  created: '19 years ago',
  karma: 157316,
  about: '<p>Bug fixer.</p>',
});

/**
 * Routes are registered on the context (not the page) so requests made by the PWA service worker
 * are mocked too; `page.route` misses them once the worker controls the page.
 */
export async function mockHnApi(context: BrowserContext) {
  await context.route(/https:\/\/node-hnapi\.herokuapp\.com\/.*/, async (route) => {
    const url = new URL(route.request().url());
    const [, first, second] = url.pathname.split('/');
    if (first === 'item') {
      return route.fulfill({ json: item(Number(second)) });
    }
    const pageNum = Number(url.searchParams.get('page') ?? '1');
    return route.fulfill({ json: feedPage(pageNum) });
  });
  await context.route(/https:\/\/api\.hnpwa\.com\/v0\/user\/.*/, async (route) => {
    const id = decodeURIComponent(new URL(route.request().url()).pathname.split('/').pop()!.replace('.json', ''));
    return route.fulfill({ json: user(id) });
  });
}

/** `test` with the HN API mocked for every page and the service worker. */
export const test = base.extend<{ mockApi: void }>({
  mockApi: [
    async ({ context }, use) => {
      await mockHnApi(context);
      await use();
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';
