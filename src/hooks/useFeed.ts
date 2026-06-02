import { useEffect, useState } from 'react';
import { fetchFeed } from '../services/hackerNewsApi';
import type { Story } from '../types/story';

interface UseFeedResult {
  items: Story[] | null;
  error: string;
  loading: boolean;
}

export function useFeed(feedType: string, page: number): UseFeedResult {
  const [items, setItems] = useState<Story[] | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setItems(null);
    setError('');
    setLoading(true);

    fetchFeed(feedType, page, controller.signal)
      .then((data) => {
        setItems(data);
        setLoading(false);
        window.scrollTo(0, 0);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        setError(`Could not load ${feedType} stories.`);
        setLoading(false);
      });

    return () => controller.abort();
  }, [feedType, page]);

  return { items, error, loading };
}
