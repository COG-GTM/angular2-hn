import { useEffect, useState } from 'react';

export type AsyncData<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error' };

const LOADING = { status: 'loading' } as const;

/**
 * Loads data for `key`, reporting `loading` again as soon as `key` changes.
 * `load` must be referentially stable for the same `key`.
 */
export function useAsyncData<T>(key: string, load: (signal: AbortSignal) => Promise<T>): AsyncData<T> {
  const [state, setState] = useState<{ key: string; value: AsyncData<T> }>({ key, value: LOADING });

  useEffect(() => {
    const controller = new AbortController();

    load(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setState({ key, value: { status: 'success', data } });
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setState({ key, value: { status: 'error' } });
        }
      });

    return () => controller.abort();
  }, [key, load]);

  return state.key === key ? state.value : LOADING;
}
