import { useState, useEffect, useCallback } from 'react';
import { Story, User, PollResult } from '../models';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

interface UseFeedResult {
  items: Story[] | null;
  loading: boolean;
  error: string | null;
}

interface UseItemResult {
  item: Story | null;
  loading: boolean;
  error: string | null;
}

interface UseUserResult {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useFeed(feedType: string, page: number): UseFeedResult {
  const [items, setItems] = useState<Story[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setItems(null);

    fetch(`${BASE_URL}/${feedType}?page=${page}`)
      .then(res => res.json())
      .then((data: Story[]) => {
        if (!cancelled) {
          setItems(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(`Could not load ${feedType} stories.`);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [feedType, page]);

  return { items, loading, error };
}

export function useItem(id: number): UseItemResult {
  const [item, setItem] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPollContent = useCallback(async (pollId: number): Promise<PollResult> => {
    const res = await fetch(`${BASE_URL}/item/${pollId}`);
    return res.json();
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setItem(null);

    fetch(`${BASE_URL}/item/${id}`)
      .then(res => res.json())
      .then(async (story: Story) => {
        if (cancelled) return;

        if (story.type === 'poll' && story.poll) {
          const numberOfPollOptions = story.poll.length;
          let pollVotesCount = 0;
          const pollResults: PollResult[] = [];

          for (let i = 1; i <= numberOfPollOptions; i++) {
            try {
              const pollResult = await fetchPollContent(story.id + i);
              pollResults.push(pollResult);
              pollVotesCount += pollResult.points;
            } catch {
              // Ignore poll fetch errors
            }
          }

          story.poll = pollResults;
          story.poll_votes_count = pollVotesCount;
        }

        if (!cancelled) {
          setItem(story);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Could not load item comments.');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id, fetchPollContent]);

  return { item, loading, error };
}

export function useUser(id: string): UseUserResult {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setUser(null);

    fetch(`${BASE_URL}/user/${id}`)
      .then(res => res.json())
      .then((data: User) => {
        if (!cancelled) {
          setUser(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(`Could not load user ${id}.`);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { user, loading, error };
}
