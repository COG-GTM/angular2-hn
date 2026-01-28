import { useState, useEffect, useCallback } from 'react';
import type { Story } from '../models/story';
import type { User } from '../models/user';
import type { FeedType } from '../models/feed-type';
import type { PollResult } from '../models/poll-result';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

async function fetchJSON<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

async function fetchPollContent(id: number): Promise<PollResult> {
  return fetchJSON<PollResult>(`${BASE_URL}/item/${id}`);
}

export function useFeed(feedType: FeedType, page: number): FetchState<Story[]> {
  const [data, setData] = useState<Story[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const stories = await fetchJSON<Story[]>(`${BASE_URL}/${feedType}?page=${page}`);
        if (!cancelled) {
          setData(stories);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [feedType, page]);

  return { data, loading, error };
}

export function useItemDetails(itemId: number | null): FetchState<Story> {
  const [data, setData] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (itemId === null) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const story = await fetchJSON<Story>(`${BASE_URL}/item/${itemId}`);

        if (cancelled) return;

        if (story.type === 'poll' && story.poll && story.poll.length > 0) {
          const numberOfPollOptions = story.poll.length;
          let pollVotesCount = 0;
          const pollResults: PollResult[] = [];

          for (let i = 1; i <= numberOfPollOptions; i++) {
            try {
              const pollResult = await fetchPollContent(story.id + i);
              pollResults[i - 1] = pollResult;
              pollVotesCount += pollResult.points;
            } catch {
              pollResults[i - 1] = { points: 0, content: '' };
            }
          }

          if (!cancelled) {
            setData({
              ...story,
              poll: pollResults,
              poll_votes_count: pollVotesCount,
            });
          }
        } else {
          if (!cancelled) {
            setData(story);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [itemId]);

  return { data, loading, error };
}

export function useUser(userId: string | null): FetchState<User> {
  const [data, setData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (userId === null) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const user = await fetchJSON<User>(`${BASE_URL}/user/${userId}`);
        if (!cancelled) {
          setData(user);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { data, loading, error };
}

export function useRefetchFeed(): {
  refetch: (feedType: FeedType, page: number) => Promise<Story[]>;
  loading: boolean;
  error: Error | null;
} {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async (feedType: FeedType, page: number): Promise<Story[]> => {
    setLoading(true);
    setError(null);

    try {
      const stories = await fetchJSON<Story[]>(`${BASE_URL}/${feedType}?page=${page}`);
      return stories;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { refetch, loading, error };
}
