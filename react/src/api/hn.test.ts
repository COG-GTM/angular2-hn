import { describe, expect, it } from 'vitest';
import { mockFetch } from '../test/fetchMock';
import { newsPage1 } from '../test/fixtures/stories';
import {
  fetchFeed,
  fetchItem,
  fetchUser,
  HN_API_BASE_URL,
  HN_FIREBASE_BASE_URL,
  HttpError,
  normalizeFirebaseUser,
} from './hn';
import type { Item } from './types';

const DAY = 86400;

describe('fetchFeed', () => {
  it.each(['news', 'newest', 'show', 'ask', 'jobs'] as const)('requests /%s?page=n', async (feed) => {
    const spy = mockFetch({ [`${HN_API_BASE_URL}/${feed}?page=3`]: newsPage1 });
    await expect(fetchFeed(feed, 3)).resolves.toEqual(newsPage1);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('forwards the abort signal', async () => {
    const spy = mockFetch({ [`${HN_API_BASE_URL}/news?page=1`]: [] });
    const controller = new AbortController();
    await fetchFeed('news', 1, { signal: controller.signal });
    expect(spy).toHaveBeenCalledWith(`${HN_API_BASE_URL}/news?page=1`, { signal: controller.signal });
  });

  it('throws HttpError on non-2xx responses', async () => {
    mockFetch({ [`${HN_API_BASE_URL}/news?page=1`]: { status: 503, body: { error: 'down' } } });
    const err = await fetchFeed('news', 1).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(HttpError);
    expect(err).toMatchObject({ status: 503, url: `${HN_API_BASE_URL}/news?page=1` });
  });
});

describe('fetchItem', () => {
  const story: Item = {
    ...newsPage1[0],
    type: 'link',
    content: '',
    comments: [
      {
        id: 2,
        level: 0,
        user: 'carol',
        time: 1,
        time_ago: 'now',
        content: '<p>hi</p>',
        comments: [],
      },
    ],
  };

  it('returns non-poll items unchanged', async () => {
    mockFetch({ [`${HN_API_BASE_URL}/item/${story.id}`]: story });
    await expect(fetchItem(story.id)).resolves.toEqual(story);
  });

  it('resolves poll options from consecutive item ids and sums votes', async () => {
    const poll: Item = {
      ...story,
      id: 100,
      type: 'poll',
      comments: [],
      poll: [
        { item: 'Yes', points: 0 },
        { item: 'No', points: 0 },
      ],
    };
    mockFetch({
      [`${HN_API_BASE_URL}/item/100`]: poll,
      [`${HN_API_BASE_URL}/item/101`]: { content: 'Yes', points: 30 },
      [`${HN_API_BASE_URL}/item/102`]: { content: 'No', points: 12 },
    });

    const item = await fetchItem(100);

    expect(item.poll).toEqual([
      { content: 'Yes', points: 30 },
      { content: 'No', points: 12 },
    ]);
    expect(item.poll_votes_count).toBe(42);
  });
});

describe('fetchUser', () => {
  const nodeUser = { id: 'pg', created_time: 1160418092, created: '19 years ago', karma: 157000, avg: null, about: 'Bug fixer.' };

  it('returns the node-hnapi user when available', async () => {
    mockFetch({ [`${HN_API_BASE_URL}/user/pg`]: nodeUser });
    await expect(fetchUser('pg')).resolves.toEqual(nodeUser);
  });

  it('falls back to the official HN API when node-hnapi returns 404', async () => {
    const spy = mockFetch({
      [`${HN_API_BASE_URL}/user/pg`]: { status: 404, body: {} },
      [`${HN_FIREBASE_BASE_URL}/user/pg.json`]: {
        id: 'pg',
        created: 1160418092,
        karma: 157000,
        about: 'Bug fixer.',
        submitted: [1, 2, 3],
      },
    });

    const user = await fetchUser('pg');

    expect(spy).toHaveBeenCalledTimes(2);
    expect(user).toMatchObject({
      id: 'pg',
      created_time: 1160418092,
      karma: 157000,
      about: 'Bug fixer.',
      submitted: [1, 2, 3],
    });
    expect(user.created).toMatch(/years? ago$/);
  });

  it('does not fall back on other errors', async () => {
    const spy = mockFetch({ [`${HN_API_BASE_URL}/user/pg`]: { status: 500, body: {} } });
    await expect(fetchUser('pg')).rejects.toMatchObject({ status: 500 });
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('throws a 404 HttpError when the user does not exist in either API', async () => {
    mockFetch({
      [`${HN_API_BASE_URL}/user/nobody`]: { status: 404, body: {} },
      [`${HN_FIREBASE_BASE_URL}/user/nobody.json`]: null,
    });
    await expect(fetchUser('nobody')).rejects.toMatchObject({ name: 'HttpError', status: 404 });
  });

  it('URL-encodes the user id', async () => {
    const spy = mockFetch({ [`${HN_API_BASE_URL}/user/a%2Fb`]: { ...nodeUser, id: 'a/b' } });
    await fetchUser('a/b');
    expect(spy).toHaveBeenCalledWith(`${HN_API_BASE_URL}/user/a%2Fb`, expect.anything());
  });
});

describe('normalizeFirebaseUser', () => {
  const now = 2_000_000_000 * 1000;
  const base = { id: 'x', karma: 1 };

  it.each([
    [0, '0 days ago'],
    [1, '1 day ago'],
    [29, '29 days ago'],
    [30, '1 month ago'],
    [90, '3 months ago'],
    [365, '1 year ago'],
    [365 * 5 + 10, '5 years ago'],
  ])('formats an account %i days old as "%s"', (days, expected) => {
    const user = normalizeFirebaseUser({ ...base, created: now / 1000 - days * DAY }, now);
    expect(user.created).toBe(expected);
  });
});
