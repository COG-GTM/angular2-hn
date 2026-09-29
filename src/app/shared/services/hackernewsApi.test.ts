import { makeFeed, makeStory, user } from '../../../test/fixtures';
import { mockFetch } from '../../../test/utils';
import { API_BASE_URL, fetchFeed, fetchItemContent, fetchUser, USER_API_BASE_URL } from './hackernewsApi';

describe('hackernewsApi', () => {
  it('fetches a feed page', async () => {
    const feed = makeFeed(2);
    const fetchMock = mockFetch({ [`${API_BASE_URL}/show?page=2`]: feed });

    await expect(fetchFeed('show', 2)).resolves.toEqual(feed);
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/show?page=2`, { signal: undefined });
  });

  it('rejects on HTTP errors', async () => {
    mockFetch({});
    await expect(fetchFeed('news', 1)).rejects.toThrow('404');
  });

  it('fetches an item', async () => {
    const story = makeStory({ id: 7 });
    mockFetch({ [`${API_BASE_URL}/item/7`]: story });
    await expect(fetchItemContent(7)).resolves.toEqual(story);
  });

  it('loads poll options and totals their votes', async () => {
    const poll = makeStory({
      id: 10,
      type: 'poll',
      poll: [
        { points: 0, content: '' },
        { points: 0, content: '' },
      ],
    });
    mockFetch({
      [`${API_BASE_URL}/item/10`]: poll,
      [`${API_BASE_URL}/item/11`]: { points: 30, content: 'Yes' },
      [`${API_BASE_URL}/item/12`]: { points: 10, content: 'No' },
    });

    const result = await fetchItemContent(10);

    expect(result.poll).toEqual([
      { points: 30, content: 'Yes' },
      { points: 10, content: 'No' },
    ]);
    expect(result.poll_votes_count).toBe(40);
  });

  it('fetches a user', async () => {
    mockFetch({ [`${USER_API_BASE_URL}/user/pg.json`]: user });
    await expect(fetchUser('pg')).resolves.toEqual(user);
  });

  it('rejects unknown users', async () => {
    mockFetch({ [`${USER_API_BASE_URL}/user/nobody.json`]: null });
    await expect(fetchUser('nobody')).rejects.toThrow('User nobody not found');
  });
});
