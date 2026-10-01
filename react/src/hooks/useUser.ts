import { useEffect, useState } from 'react';
import { fetchUser } from '../api/hn';
import type { User } from '../api/types';

export type UserState =
  | { status: 'loading' }
  | { status: 'error'; error: unknown }
  | { status: 'success'; user: User };

/** Loads a user profile; aborts on id change or unmount. */
export function useUser(id: string): UserState {
  const [result, setResult] = useState<{ id: string; state: UserState } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchUser(id, { signal: controller.signal }).then(
      (user) => setResult({ id, state: { status: 'success', user } }),
      (error: unknown) => {
        if (!controller.signal.aborted) {
          setResult({ id, state: { status: 'error', error } });
        }
      },
    );
    return () => controller.abort();
  }, [id]);

  return result?.id === id ? result.state : { status: 'loading' };
}
