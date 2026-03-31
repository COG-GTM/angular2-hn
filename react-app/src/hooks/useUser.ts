import { useState, useEffect } from 'react';
import type { User } from '../models/user';
import { fetchUser } from '../services/api';

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
    setUser(null);
    setError('');
    setLoading(true);

    const controller = new AbortController();

    fetchUser(id, controller.signal)
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setError(`Could not load user ${id}.`);
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [id]);

  return { user, error, loading };
}
