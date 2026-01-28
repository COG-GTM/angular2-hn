import { useState, useEffect } from 'react';
import { hackerNewsApi } from '../services/hackernews-api';
import { Story, User } from '../models';

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

    hackerNewsApi
      .fetchFeed(feedType, page)
      .then((data) => {
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

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setItem(null);

    hackerNewsApi
      .fetchItemContent(id)
      .then((data) => {
        if (!cancelled) {
          setItem(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Could not load item.');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

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

    hackerNewsApi
      .fetchUser(id)
      .then((data) => {
        if (!cancelled) {
          setUser(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Could not load user.');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { user, loading, error };
}
