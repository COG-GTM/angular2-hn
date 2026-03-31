import { useState, useEffect } from 'react';
import type { Story } from '../models/story';
import { fetchFeed } from '../services/api';

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
    setItems(null);
    setError('');
    setLoading(true);

    const controller = new AbortController();

    fetchFeed(feedType, page, controller.signal)
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setError(`Could not load ${feedType} stories.`);
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [feedType, page]);

  return { items, error, loading };
}
