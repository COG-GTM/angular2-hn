import { useState, useEffect, useMemo } from 'react';
import type { User } from '../models/user';
import { fetchUser } from '../services/api';

interface UseUserResult {
  user: User | null;
  error: string;
  loading: boolean;
}

export function useUser(id: string): UseUserResult {
  const [results, setResults] = useState<Record<string, { user: User | null; error: string; loading: boolean }>>({});

  useEffect(() => {
    const controller = new AbortController();

    fetchUser(id, controller.signal)
      .then((data) => {
        setResults((prev) => ({
          ...prev,
          [id]: { user: data, error: '', loading: false },
        }));
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setResults((prev) => ({
            ...prev,
            [id]: { user: null, error: `Could not load user ${id}.`, loading: false },
          }));
        }
      });

    return () => controller.abort();
  }, [id]);

  return useMemo(() => results[id] ?? { user: null, error: '', loading: true }, [results, id]);
}
