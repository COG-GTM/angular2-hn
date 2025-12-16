import { useState, useEffect, useCallback } from 'react';
import { Story, User, PollResult } from '../types';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

export const useFeed = (feedType: string, page: number) => {
  const [items, setItems] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchFeed = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${BASE_URL}/${feedType}?page=${page}`);
        if (!response.ok) {
          throw new Error('Failed to fetch feed');
        }
        const data = await response.json();
        if (!cancelled) {
          setItems(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(`Could not load ${feedType} stories.`);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchFeed();

    return () => {
      cancelled = true;
    };
  }, [feedType, page]);

  return { items, loading, error };
};

export const useItemContent = (id: number) => {
  const [item, setItem] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPollContent = useCallback(async (pollId: number): Promise<PollResult> => {
    const response = await fetch(`${BASE_URL}/item/${pollId}`);
    return response.json();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchItemContent = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${BASE_URL}/item/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch item');
        }
        const story: Story = await response.json();

        if (story.type === 'poll' && story.poll && story.poll.length > 0) {
          const numberOfPollOptions = story.poll.length;
          let pollVotesCount = 0;
          const pollResults: PollResult[] = [];

          for (let i = 1; i <= numberOfPollOptions; i++) {
            const pollResult = await fetchPollContent(story.id + i);
            pollResults.push(pollResult);
            pollVotesCount += pollResult.points;
          }

          story.poll = pollResults;
          story.poll_votes_count = pollVotesCount;
        }

        if (!cancelled) {
          setItem(story);
        }
      } catch (err) {
        if (!cancelled) {
          setError('Could not load item comments.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchItemContent();
    }

    return () => {
      cancelled = true;
    };
  }, [id, fetchPollContent]);

  return { item, loading, error };
};

export const useUser = (userId: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${BASE_URL}/user/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }
        const data = await response.json();
        if (!cancelled) {
          setUser(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(`Could not load user ${userId}.`);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (userId) {
      fetchUser();
    }

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { user, loading, error };
};
