import { useState, useEffect } from 'react';
import { User } from '../types/user';
import { fetchUser } from '../api/hackerNewsApi';

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
    setLoading(true);
    setError('');

    fetchUser(id, controller.signal)
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(err.message || 'Error fetching user');
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [id]);

  return { user, error, loading };
}
