import { useEffect, useState, type DependencyList } from 'react';

export interface AsyncState<T> {
  data: T | undefined;
  error: unknown;
  loading: boolean;
}

/**
 * Runs `load` whenever `deps` change, aborting the previous request (mirrors the
 * unsubscribe-cancels-fetch behaviour of the Angular lazyFetch observable).
 */
export function useAsync<T>(load: (signal: AbortSignal) => Promise<T>, deps: DependencyList): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: undefined, error: undefined, loading: true });

  useEffect(() => {
    const controller = new AbortController();
    setState({ data: undefined, error: undefined, loading: true });
    load(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setState({ data, error: undefined, loading: false });
      },
      (error: unknown) => {
        if (!controller.signal.aborted) setState({ data: undefined, error, loading: false });
      },
    );
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
