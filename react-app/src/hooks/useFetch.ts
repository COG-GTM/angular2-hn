import { useEffect, useRef, useSyncExternalStore, useCallback } from 'react';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string;
}

export function useFetch<T>(
  fetcher: () => Promise<T>,
  deps: readonly unknown[],
  errorMessage: string,
): FetchState<T> {
  const stateRef = useRef<FetchState<T>>({ data: null, loading: true, error: '' });
  const listenersRef = useRef(new Set<() => void>());
  const requestRef = useRef(0);

  const subscribe = useCallback((listener: () => void) => {
    listenersRef.current.add(listener);
    return () => { listenersRef.current.delete(listener); };
  }, []);

  const getSnapshot = useCallback(() => stateRef.current, []);

  useEffect(() => {
    const requestId = ++requestRef.current;
    let cancelled = false;

    stateRef.current = { data: null, loading: true, error: '' };
    for (const listener of listenersRef.current) listener();

    fetcher()
      .then(result => {
        if (!cancelled && requestId === requestRef.current) {
          stateRef.current = { data: result, loading: false, error: '' };
          for (const listener of listenersRef.current) listener();
          window.scrollTo(0, 0);
        }
      })
      .catch(() => {
        if (!cancelled && requestId === requestRef.current) {
          stateRef.current = { data: null, loading: false, error: errorMessage };
          for (const listener of listenersRef.current) listener();
        }
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return useSyncExternalStore(subscribe, getSnapshot);
}
