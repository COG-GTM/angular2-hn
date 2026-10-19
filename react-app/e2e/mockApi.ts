import type { BrowserContext, Page, Route } from '@playwright/test';
import { commentTree, linkStory, makeFeed, user } from '../src/test/fixtures';

export const FEED_TITLES = {
  news: (n: number) => `News story ${n}`,
  newest: (n: number) => `Newest story ${n}`,
};

function feed(prefix: (n: number) => string, page: number) {
  return makeFeed(30, (page - 1) * 30 + 1).map((s) => ({ ...s, title: prefix(s.id), user: 'pg' }));
}

export const ITEM_ID = 1;
export const item = {
  ...linkStory,
  id: ITEM_ID,
  title: FEED_TITLES.news(1),
  user: 'pg',
  content: '',
  comments: commentTree,
  comments_count: 3,
};

const json = (route: Route, body: unknown, status = 200) =>
  route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body), headers: { 'Access-Control-Allow-Origin': '*' } });

/** Serves deterministic fixtures for node-hnapi and the HNPWA user endpoint. */
export async function mockHnApi(target: Page | BrowserContext) {
  await target.route('https://node-hnapi.herokuapp.com/**', (route) => {
    const url = new URL(route.request().url());
    const page = Number(url.searchParams.get('page') ?? '1');
    const [, kind, id] = url.pathname.split('/');
    if (kind === 'news') return json(route, feed(FEED_TITLES.news, page));
    if (kind === 'newest') return json(route, feed(FEED_TITLES.newest, page));
    if (['show', 'ask', 'jobs'].includes(kind)) return json(route, feed((n) => `${kind} story ${n}`, page));
    if (kind === 'item') return Number(id) === ITEM_ID ? json(route, item) : json(route, { ...item, id: Number(id) });
    return json(route, { error: 'not found' }, 404);
  });
  await target.route('https://api.hnpwa.com/v0/user/**', (route) => {
    const id = decodeURIComponent(new URL(route.request().url()).pathname.split('/').pop()!.replace(/\.json$/, ''));
    return json(route, id === user.id ? user : null);
  });
}
