import { useState, useEffect, useMemo } from 'react';
import type { Story } from '../models/story';
import { fetchItemContent } from '../services/api';

interface UseItemDetailsResult {
  item: Story | null;
  error: string;
  loading: boolean;
}

export function useItemDetails(id: number): UseItemDetailsResult {
  const key = String(id);
  const [results, setResults] = useState<Record<string, { item: Story | null; error: string; loading: boolean }>>({});

  useEffect(() => {
    const controller = new AbortController();

    fetchItemContent(id, controller.signal)
      .then((data) => {
        setResults((prev) => ({
          ...prev,
          [key]: { item: data, error: '', loading: false },
        }));
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setResults((prev) => ({
            ...prev,
            [key]: { item: null, error: 'Could not load item comments.', loading: false },
          }));
        }
      });

    return () => controller.abort();
  }, [id, key]);

  return useMemo(() => results[key] ?? { item: null, error: '', loading: true }, [results, key]);
}
