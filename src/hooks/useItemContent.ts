import { useEffect, useState } from 'react';
import { fetchItemContent } from '../services/hackerNewsApi';
import type { Story } from '../types/story';

interface UseItemContentResult {
  item: Story | null;
  error: string;
  loading: boolean;
}

export function useItemContent(id: number): UseItemContentResult {
  const [item, setItem] = useState<Story | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setItem(null);
    setError('');
    setLoading(true);
    window.scrollTo(0, 0);

    fetchItemContent(id, controller.signal)
      .then((data) => {
        setItem(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        setError('Could not load item comments.');
        setLoading(false);
      });

    return () => controller.abort();
  }, [id]);

  return { item, error, loading };
}
