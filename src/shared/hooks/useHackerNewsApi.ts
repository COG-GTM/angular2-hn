import { useEffect, useState } from 'react';
import type { Story, User, PollResult } from '../types';

const baseUrl = 'https://node-hnapi.herokuapp.com';

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === 'AbortError';
}

export function useFeed(
  feedType: string,
  page: number,
): { items: Story[]; error: string; loading: boolean } {
  const [items, setItems] = useState<Story[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${baseUrl}/${feedType}?page=${page}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }
        const data = (await res.json()) as Story[];
        if (!active) {
          return;
        }
        setItems(data);
        setLoading(false);
      } catch (err: unknown) {
        if (!active || isAbortError(err)) {
          return;
        }
        setItems([]);
        setError('Could not load the feed. Please try again.');
        setLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
      controller.abort();
    };
  }, [feedType, page]);

  return { items, error, loading };
}

export function useItemDetails(
  id: number,
): { item: Story | null; error: string; loading: boolean } {
  const [item, setItem] = useState<Story | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${baseUrl}/item/${id}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }
        const story = (await res.json()) as Story;

        if (story.type === 'poll') {
          story.poll_votes_count = 0;
          const results = await Promise.all(
            story.poll.map(async (_, index) => {
              const pollRes = await fetch(`${baseUrl}/item/${story.id + index + 1}`, {
                signal: controller.signal,
              });
              if (!pollRes.ok) {
                throw new Error(`Request failed with status ${pollRes.status}`);
              }
              return (await pollRes.json()) as PollResult;
            }),
          );
          results.forEach((result, index) => {
            story.poll[index] = result;
            story.poll_votes_count += result.points;
          });
        }

        if (!active) {
          return;
        }
        setItem(story);
        setLoading(false);
      } catch (err: unknown) {
        if (!active || isAbortError(err)) {
          return;
        }
        setItem(null);
        setError('Could not load this item. Please try again.');
        setLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
      controller.abort();
    };
  }, [id]);

  return { item, error, loading };
}

export function useUser(
  id: string,
): { user: User | null; error: string; loading: boolean } {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${baseUrl}/user/${id}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }
        const data = (await res.json()) as User;
        if (!active) {
          return;
        }
        setUser(data);
        setLoading(false);
      } catch (err: unknown) {
        if (!active || isAbortError(err)) {
          return;
        }
        setUser(null);
        setError('Could not load this user. Please try again.');
        setLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
      controller.abort();
    };
  }, [id]);

  return { user, error, loading };
}
