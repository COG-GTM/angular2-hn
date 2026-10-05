import { mockFetch } from '../test/render';
import { makePollResult, makeStory, makeUser } from '../test/fixtures';
import { HN_API_BASE_URL, HN_USER_API_BASE_URL, HttpError, fetchFeed, fetchItemContent, fetchUser } from './client';

describe('HN API client', () => {
  it('fetches a feed page', async () => {
    const fetchMock = mockFetch(() => [makeStory()]);
    const stories = await fetchFeed('show', 2);
    expect(fetchMock).toHaveBeenCalledWith(`${HN_API_BASE_URL}/show?page=2`, expect.anything());
    expect(stories).toHaveLength(1);
  });

  it('rejects with HttpError on non-2xx responses', async () => {
    mockFetch(() => undefined);
    await expect(fetchFeed('news', 1)).rejects.toBeInstanceOf(HttpError);
  });

  it('fetches an item', async () => {
    mockFetch((url) => (url.endsWith('/item/5') ? makeStory({ id: 5 }) : undefined));
    expect((await fetchItemContent(5)).id).toBe(5);
  });

  it('expands poll options and sums poll votes', async () => {
    const poll = makeStory({ id: 10, type: 'poll', poll: [makePollResult(), makePollResult()] });
    mockFetch((url) => {
      if (url.endsWith('/item/10')) return poll;
      if (url.endsWith('/item/11')) return { points: 3, content: 'Yes' };
      if (url.endsWith('/item/12')) return { points: 7, content: 'No' };
      return undefined;
    });
    const story = await fetchItemContent(10);
    expect(story.poll).toEqual([
      { points: 3, content: 'Yes' },
      { points: 7, content: 'No' },
    ]);
    expect(story.poll_votes_count).toBe(10);
  });

  it('fetches a user from the HNPWA user endpoint', async () => {
    const fetchMock = mockFetch(() => makeUser({ id: 'pg' }));
    expect((await fetchUser('pg')).id).toBe('pg');
    expect(fetchMock).toHaveBeenCalledWith(`${HN_USER_API_BASE_URL}/user/pg.json`, expect.anything());
  });
});
