import type { Page, Route } from '@playwright/test';
import feed from '../fixtures/feed.json' with { type: 'json' };
import poll from '../fixtures/poll.json' with { type: 'json' };
import story from '../fixtures/story.json' with { type: 'json' };
import user from '../fixtures/user.json' with { type: 'json' };

export const fixtures = { feed, story, poll, user };

export interface MockApiOptions {
  /** Delay every mocked response by this many milliseconds. */
  delayMs?: number;
  /** Fail every mocked request with this status code. */
  status?: number;
  /** Override the payload returned for a given path, e.g. `/item/1`. */
  overrides?: Record<string, unknown>;
}

const FEED_TYPES = ['news', 'newest', 'show', 'ask', 'jobs'];

function payloadFor(pathname: string, overrides: Record<string, unknown>): unknown | undefined {
  if (overrides[pathname] !== undefined) {
    return overrides[pathname];
  }

  const feedType = FEED_TYPES.find((type) => pathname === `/${type}`);
  if (feedType) {
    return feed;
  }

  if (pathname === `/item/${poll.id}`) {
    return poll;
  }

  const pollOption = poll.poll.findIndex((_option, index) => pathname === `/item/${poll.id + index + 1}`);
  if (pollOption >= 0) {
    return poll.poll[pollOption];
  }

  if (pathname.startsWith('/item/')) {
    return story;
  }

  if (pathname.startsWith('/user/')) {
    return user;
  }

  return undefined;
}

export async function mockApi(page: Page, options: MockApiOptions = {}): Promise<void> {
  const { delayMs = 0, status, overrides = {} } = options;

  await page.route('**/node-hnapi.herokuapp.com/**', async (route: Route) => {
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    if (status && status >= 400) {
      await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ error: true }) });
      return;
    }

    const { pathname } = new URL(route.request().url());
    const payload = payloadFor(pathname, overrides);

    if (payload === undefined) {
      await route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ error: 'not found' }) });
      return;
    }

    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(payload) });
  });
}
