import { useState, useEffect } from 'react';
import { Story } from '../types/story';
import { fetchFeed } from '../api/hackerNewsApi';

interface UseFeedResult {
  items: Story[];
  error: string;
  loading: boolean;
}

export function useFeed(feedType: string, page: number): UseFeedResult {
  const [items, setItems] = useState<Story[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    fetchFeed(feedType, page, controller.signal)
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(err.message || 'Error fetching feed');
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [feedType, page]);

  return { items, error, loading };
}
