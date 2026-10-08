import { BrowserContext, Page, Route } from '@playwright/test';

export const API = 'https://node-hnapi.herokuapp.com';

const story = (id: number, title: string, extra: object = {}) => ({
  id,
  title,
  points: id,
  user: `author${id}`,
  time: 1700000000,
  time_ago: '2 hours ago',
  comments_count: 1,
  type: 'link',
  url: `https://example.com/${id}`,
  domain: 'example.com',
  ...extra,
});

export const FEED = [
  story(101, 'First mocked story'),
  story(102, 'Second mocked story'),
  story(103, 'Ask HN: Third mocked story', { url: 'item?id=103', domain: undefined }),
];

export const item = (id: number) => {
  const base = FEED.find(s => s.id === id) || story(id, `Story ${id}`);
  return {
    ...base,
    content: '',
    comments: [
      {
        id: id * 10,
        level: 0,
        user: 'commenter',
        time: 1700000000,
        time_ago: '1 hour ago',
        content: `<p>Top comment on ${id}</p>`,
        comments: [
          { id: id * 10 + 1, level: 1, user: 'replier', time: 1700000000, time_ago: 'now', content: `<p>Nested reply on ${id}</p>`, comments: [] },
        ],
      },
    ],
  };
};

const ANALYTICS = /google-analytics\.com/;

export async function mockApi(context: BrowserContext) {
  await context.route(ANALYTICS, route => route.fulfill({ status: 204, body: '' }));
  await context.route(`${API}/**`, (route: Route) => {
    const url = new URL(route.request().url());
    const itemMatch = url.pathname.match(/^\/item\/(\d+)$/);
    const body = itemMatch ? item(Number(itemMatch[1])) : FEED;
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(body),
    });
  });
}

export async function goOffline(context: BrowserContext) {
  await context.unrouteAll({ behavior: 'ignoreErrors' });
  await context.route(/^https?:\/\/(?!localhost)/, route => route.abort('internetdisconnected'));
  await context.setOffline(true);
}

/** Waits until the Angular service worker is installed and controls the page. */
export async function waitForServiceWorker(page: Page) {
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined));
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
}

/** Resolves once the given item's comment tree has been cached in IndexedDB. */
export async function waitForCachedItem(page: Page, id: number) {
  await page.waitForFunction(
    itemId =>
      new Promise<boolean>(resolve => {
        const open = indexedDB.open('angular2-hn-saved');
        open.onerror = () => resolve(false);
        open.onsuccess = () => {
          const db = open.result;
          if (!db.objectStoreNames.contains('items')) {
            db.close();
            return resolve(false);
          }
          const req = db.transaction('items').objectStore('items').get(itemId);
          req.onsuccess = () => {
            db.close();
            resolve(!!(req.result && req.result.comments && req.result.comments.length));
          };
          req.onerror = () => resolve(false);
        };
      }),
    id
  );
}
