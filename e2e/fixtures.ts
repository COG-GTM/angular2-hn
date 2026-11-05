import { Page } from '@playwright/test';

export const story = (id: number, overrides: Record<string, unknown> = {}) => ({
  id,
  title: `Story ${id}`,
  points: 100 + id,
  user: 'pg',
  time: 1700000000,
  time_ago: '2 hours ago',
  comments_count: 3,
  type: 'link',
  url: `https://example.com/${id}`,
  domain: 'example.com',
  ...overrides,
});

export const feed = (count: number, offset = 0) =>
  Array.from({ length: count }, (_, i) => story(offset + i + 1));

export const item = {
  ...story(42, { title: 'Ask HN: Test item', url: 'item?id=42', domain: undefined, type: 'ask' }),
  content: '<p>Item body text</p>',
  comments: [
    {
      id: 100,
      level: 0,
      user: 'alice',
      time: 1700000000,
      time_ago: '1 hour ago',
      content: '<p>First comment</p>',
      comments: [
        { id: 101, level: 1, user: 'bob', time: 1700000000, time_ago: '30 minutes ago', content: '<p>Reply</p>', comments: [] },
      ],
    },
  ],
};

export const user = { id: 'pg', created: 1160418092, karma: 157316, about: 'Bug fixer.' };

export async function mockHnApi(page: Page) {
  await page.route('https://api.hackerwebapp.com/**', route => {
    const url = new URL(route.request().url());
    if (url.pathname.startsWith('/item/')) {
      return route.fulfill({ json: item });
    }
    const pageNum = Number(url.searchParams.get('page') ?? 1);
    return route.fulfill({ json: feed(pageNum === 1 ? 30 : 5, (pageNum - 1) * 30) });
  });
  await page.route('https://hacker-news.firebaseio.com/v0/user/**', route => {
    const id = decodeURIComponent(new URL(route.request().url()).pathname.split('/').pop()!.replace('.json', ''));
    return route.fulfill({ json: id === 'pg' ? user : null });
  });
}
