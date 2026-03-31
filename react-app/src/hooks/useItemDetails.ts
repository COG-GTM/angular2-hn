import { useState, useEffect } from 'react';
import type { Story } from '../models/story';
import { fetchItemContent } from '../services/api';

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
    setItem(null);
    setError('');
    setLoading(true);

    const controller = new AbortController();

    fetchItemContent(id, controller.signal)
      .then((data) => {
        setItem(data);
        setLoading(false);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setError('Could not load item comments.');
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [id]);

  return { item, error, loading };
}
