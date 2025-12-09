import { useState, useEffect, useCallback } from 'react';
import { HackerNewsAPI, Story, User } from '../services/hackerNewsAPI';

export const useHackerNewsAPI = () => {
  const [api] = useState(() => new HackerNewsAPI());

  const fetchFeed = useCallback(async (feedType: string, page: number) => {
    return api.fetchFeed(feedType, page);
  }, [api]);

  const fetchItemContent = useCallback(async (id: number) => {
    return api.fetchItemContent(id);
  }, [api]);

  const fetchUser = useCallback(async (id: string) => {
    return api.fetchUser(id);
  }, [api]);

  return { fetchFeed, fetchItemContent, fetchUser };
};

export const useFeed = (feedType: string, page: number) => {
  const { fetchFeed } = useHackerNewsAPI();
  const [items, setItems] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadFeed = async () => {
      try {
        setLoading(true);
        setError(null);
        const feedItems = await fetchFeed(feedType, page);
        if (!cancelled) {
          setItems(feedItems);
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

    loadFeed();

    return () => {
      cancelled = true;
    };
  }, [feedType, page, fetchFeed]);

  return { items, loading, error };
};

export const useItem = (id: number) => {
  const { fetchItemContent } = useHackerNewsAPI();
  const [item, setItem] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadItem = async () => {
      try {
        setLoading(true);
        setError(null);
        const itemContent = await fetchItemContent(id);
        if (!cancelled) {
          setItem(itemContent);
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

    loadItem();

    return () => {
      cancelled = true;
    };
  }, [id, fetchItemContent]);

  return { item, loading, error };
};

export const useUser = (id: string) => {
  const { fetchUser } = useHackerNewsAPI();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const userData = await fetchUser(id);
        if (!cancelled) {
          setUser(userData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(`Could not load user ${id}.`);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [id, fetchUser]);

  return { user, loading, error };
};
