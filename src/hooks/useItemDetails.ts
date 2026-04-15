import { useState, useEffect } from 'react';
import { Story } from '../types/story';
import { fetchItemContent } from '../api/hackerNewsApi';

interface UseItemDetailsResult {
  item: Story | null;
  error: string;
  loading: boolean;
}

export function useItemDetails(id: number): UseItemDetailsResult {
  const [item, setItem] = useState<Story | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    fetchItemContent(id, controller.signal)
      .then((data) => {
        setItem(data);
        setLoading(false);
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(err.message || 'Error fetching item');
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [id]);

  return { item, error, loading };
}
