import { useState, useEffect, useMemo } from 'react';
import type { Story } from '../models/story';
import { fetchFeed } from '../services/api';

interface UseFeedResult {
  items: Story[] | null;
  error: string;
  loading: boolean;
}

export function useFeed(feedType: string, page: number): UseFeedResult {
  const key = `${feedType}:${page}`;
  const [results, setResults] = useState<Record<string, { items: Story[] | null; error: string; loading: boolean }>>({});

  useEffect(() => {
    const controller = new AbortController();

    fetchFeed(feedType, page, controller.signal)
      .then((data) => {
        setResults((prev) => ({
          ...prev,
          [key]: { items: data, error: '', loading: false },
        }));
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setResults((prev) => ({
            ...prev,
            [key]: { items: null, error: `Could not load ${feedType} stories.`, loading: false },
          }));
        }
      });

    return () => controller.abort();
  }, [feedType, page, key]);

  return useMemo(() => results[key] ?? { items: null, error: '', loading: true }, [results, key]);
}
