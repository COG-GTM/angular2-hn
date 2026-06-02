import { useEffect, useState } from 'react';
import { fetchUser } from '../services/hackerNewsApi';
import type { User } from '../types/user';

interface UseUserResult {
  user: User | null;
  error: string;
  loading: boolean;
}

export function useUser(id: string): UseUserResult {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setUser(null);
    setError('');
    setLoading(true);

    fetchUser(id, controller.signal)
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        setError(`Could not load user ${id}.`);
        setLoading(false);
      });

    return () => controller.abort();
  }, [id]);

  return { user, error, loading };
}
