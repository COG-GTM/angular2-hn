import type { BrowserContext } from '@playwright/test';

const API = 'https://node-hnapi.herokuapp.com';
const USER_API = 'https://api.hnpwa.com/v0';

function story(id: number, overrides: Record<string, unknown> = {}) {
  return {
    id,
    title: `Story ${id}`,
    points: 100 + id,
    user: 'pg',
    time: 1700000000,
    time_ago: '2 hours ago',
    type: 'story',
    url: `https://example.com/${id}`,
    domain: 'example.com',
    comments_count: 2,
    ...overrides,
  };
}

function feed(prefix: string, page: number, count = 30, overrides: Record<string, unknown> = {}) {
  return Array.from({ length: count }, (_, i) => {
    const id = page * 1000 + i + 1;
    return story(id, { title: `${prefix} ${(page - 1) * 30 + i + 1}`, ...overrides });
  });
}

const item = story(1, {
  title: 'Ask HN: What are you working on?',
  url: 'item?id=1',
  domain: undefined,
  content: '<p>Tell us about your projects.</p>',
  comments: [
    {
      id: 2,
      level: 0,
      user: 'alice',
      time_ago: '1 hour ago',
      content: '<p>Top level comment</p>',
      comments: [
        { id: 3, level: 1, user: 'bob', time_ago: '30 minutes ago', content: '<p>Nested reply</p>', comments: [] },
      ],
    },
    { id: 4, level: 0, deleted: true, comments: [] },
  ],
});

const user = { id: 'pg', created_time: 1160418092, created: '20 years ago', karma: 157316, about: 'Bug fixer.' };

export async function mockHackerNewsApi(context: BrowserContext) {
  await context.route(`${API}/**`, async (route) => {
    const url = new URL(route.request().url());
    const [, first, second] = url.pathname.split('/');
    const page = Number(url.searchParams.get('page') ?? 1);
    const feeds: Record<string, () => unknown> = {
      news: () => feed('News story', page),
      newest: () => feed('Newest story', page),
      show: () => feed('Show HN story', page, 10),
      ask: () => feed('Ask HN story', page, 10),
      jobs: () => feed('Job posting', page, 5, { type: 'job' }),
    };
    if (first in feeds) return route.fulfill({ json: feeds[first]() });
    if (first === 'item' && second === '1') return route.fulfill({ json: item });
    return route.fulfill({ status: 404, json: { error: 'not found' } });
  });
  await context.route(`${USER_API}/user/*.json`, (route) =>
    route.fulfill({ json: route.request().url().endsWith('/pg.json') ? user : null })
  );
}
