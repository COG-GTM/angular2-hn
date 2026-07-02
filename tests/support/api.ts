import { Page, Route } from '@playwright/test';
import stories from '../fixtures/news.json';

export const HN_API_GLOB = '**/node-hnapi.herokuapp.com/**';

export type Story = (typeof stories)[number];

export function newsStories(count = stories.length): Story[] {
  return stories.slice(0, count);
}

/**
 * Fulfils every Hacker News API request with the given payload.
 */
export async function mockFeed(page: Page, payload: Story[] = newsStories()): Promise<void> {
  await page.route(HN_API_GLOB, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(payload),
    });
  });
}

/**
 * Makes the Hacker News API respond with a 500 so the feed's error branch runs.
 * The body is intentionally non-JSON so the service's fetch pipeline errors out.
 */
export async function mockFeedError(page: Page): Promise<void> {
  await page.route(HN_API_GLOB, async (route: Route) => {
    await route.fulfill({
      status: 500,
      contentType: 'text/plain',
      body: 'Internal Server Error',
    });
  });
}

/**
 * Installs a route whose response is withheld until the returned `release`
 * callback is invoked, letting tests observe the pending/loading state.
 */
export async function mockFeedDeferred(
  page: Page,
  payload: Story[] = newsStories()
): Promise<() => void> {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });

  await page.route(HN_API_GLOB, async (route: Route) => {
    await gate;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(payload),
    });
  });

  return release;
}
