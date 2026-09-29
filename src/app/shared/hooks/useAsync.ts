import { useEffect, useState } from 'react';

type Loader<T> = (signal: AbortSignal) => Promise<T>;

interface AsyncState<T> {
  loader?: Loader<T>;
  data?: T;
  error?: unknown;
}

/**
 * Runs `loader` whenever its identity changes (memoize it with `useCallback`) and aborts stale requests.
 */
export function useAsync<T>(loader: Loader<T>): { data?: T; error?: unknown } {
  const [state, setState] = useState<AsyncState<T>>({});

  useEffect(() => {
    const controller = new AbortController();
    loader(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setState({ loader, data });
      },
      (error: unknown) => {
        if (!controller.signal.aborted) setState({ loader, error });
      }
    );
    return () => controller.abort();
  }, [loader]);

  return state.loader === loader ? state : {};
}
