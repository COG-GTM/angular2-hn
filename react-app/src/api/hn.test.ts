import { describe, expect, it } from 'vitest';
import { mockFetch } from '../test/render';
import { linkStory, pollItem, user } from '../test/fixtures';
import { BASE_URL, HNApiError, USER_BASE_URL, fetchFeed, fetchItemContent, fetchUser } from './hn';

describe('hn api', () => {
  it('fetchFeed requests the feed page from node-hnapi', async () => {
    const fetchMock = mockFetch({ '/news?page=2': [linkStory] });
    await expect(fetchFeed('news', 2)).resolves.toEqual([linkStory]);
    expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/news?page=2`, expect.anything());
  });

  it('rejects with HNApiError on non-2xx responses', async () => {
    mockFetch({ '/jobs': { __status: 503 } });
    await expect(fetchFeed('jobs', 1)).rejects.toBeInstanceOf(HNApiError);
  });

  it('fetchItemContent resolves poll options and totals votes', async () => {
    mockFetch({
      '/item/3001': { points: 30, content: 'Tabs' },
      '/item/3002': { points: 10, content: 'Spaces' },
      '/item/3000': structuredClone(pollItem),
    });
    const item = await fetchItemContent(3000);
    expect(item.poll).toEqual([
      { points: 30, content: 'Tabs' },
      { points: 10, content: 'Spaces' },
    ]);
    expect(item.poll_votes_count).toBe(40);
  });

  it('fetchItemContent returns non-poll items untouched', async () => {
    const fetchMock = mockFetch({ '/item/1001': linkStory });
    await expect(fetchItemContent(1001)).resolves.toEqual(linkStory);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('fetchUser uses the HNPWA user endpoint', async () => {
    const fetchMock = mockFetch({ '/user/pg.json': user });
    await expect(fetchUser('pg')).resolves.toEqual(user);
    expect(fetchMock).toHaveBeenCalledWith(`${USER_BASE_URL}/user/pg.json`, expect.anything());
  });

  it('fetchUser rejects when the API returns null for unknown users', async () => {
    mockFetch({ '/user/nobody.json': null });
    await expect(fetchUser('nobody')).rejects.toThrow('User nobody not found');
  });
});
