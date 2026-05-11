import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Story } from '../types/story';
import type { PollResult } from '../types/poll-result';
import type { User } from '../types/user';
import {
  fetchFeed,
  fetchItem,
  fetchPollContent,
  fetchUser,
  HN_API_BASE_URL,
} from './hackerNewsApi';

function mockJsonResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => body,
  } as Response;
}

describe('hackerNewsApi', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  it('fetchFeed builds the correct URL', async () => {
    const expected: Story[] = [];
    fetchMock.mockResolvedValueOnce(mockJsonResponse(expected));

    const result = await fetchFeed('news', 2);

    expect(fetchMock).toHaveBeenCalledWith(
      `${HN_API_BASE_URL}/news?page=2`,
      expect.objectContaining({ signal: undefined })
    );
    expect(result).toBe(expected);
  });

  it('fetchUser builds the correct URL', async () => {
    const expected: User = { id: 'dan', karma: 100, created: 'a year ago' };
    fetchMock.mockResolvedValueOnce(mockJsonResponse(expected));

    const result = await fetchUser('dan');

    expect(fetchMock).toHaveBeenCalledWith(
      `${HN_API_BASE_URL}/user/dan`,
      expect.anything()
    );
    expect(result).toEqual(expected);
  });

  it('fetchPollContent builds the correct URL', async () => {
    const expected: PollResult = { points: 5, content: 'Option A' };
    fetchMock.mockResolvedValueOnce(mockJsonResponse(expected));

    const result = await fetchPollContent(42);

    expect(fetchMock).toHaveBeenCalledWith(
      `${HN_API_BASE_URL}/item/42`,
      expect.anything()
    );
    expect(result).toEqual(expected);
  });

  it('fetchItem returns story as-is for non-poll items', async () => {
    const story = {
      id: 1,
      title: 'Hello',
      points: 10,
      user: 'me',
      time: 0,
      time_ago: 'just now',
      type: 'story' as const,
      url: 'https://example.com',
      domain: 'example.com',
      comments: [],
      comments_count: 0,
    };
    fetchMock.mockResolvedValueOnce(mockJsonResponse(story));

    const result = await fetchItem(1);

    expect(result).toEqual(story);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('fetchItem hydrates poll options and totals votes', async () => {
    const baseStory: Story = {
      id: 100,
      title: 'Poll',
      points: 1,
      user: 'dan',
      time: 0,
      time_ago: 'now',
      type: 'poll',
      url: '',
      domain: '',
      comments: [],
      comments_count: 0,
      poll: [
        { points: 0, content: '' },
        { points: 0, content: '' },
      ],
    };
    fetchMock.mockResolvedValueOnce(mockJsonResponse(baseStory));
    fetchMock.mockResolvedValueOnce(
      mockJsonResponse({ points: 3, content: 'Option A' })
    );
    fetchMock.mockResolvedValueOnce(
      mockJsonResponse({ points: 7, content: 'Option B' })
    );

    const result = await fetchItem(100);

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(result.poll).toEqual([
      { points: 3, content: 'Option A' },
      { points: 7, content: 'Option B' },
    ]);
    expect(result.poll_votes_count).toBe(10);
  });

  it('throws on non-ok responses', async () => {
    fetchMock.mockResolvedValueOnce(mockJsonResponse(null, false, 500));
    await expect(fetchFeed('news', 1)).rejects.toThrow(/Request failed/);
  });
});
