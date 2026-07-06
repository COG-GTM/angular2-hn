import { useEffect, useState } from 'react';

interface FetchState<T> {
  data: T | undefined;
  error: string;
  loading: boolean;
}

/**
 * Generic data-fetching hook wrapping a Promise-returning function.
 * `deps` re-runs the fetch (e.g. route params). `errorMessage` mirrors the
 * per-view error strings used by the original Angular components.
 */
export function useFetch<T>(
  fetcher: () => Promise<T>,
  deps: unknown[],
  errorMessage: string
): FetchState<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setData(undefined);
    setError('');
    fetcher()
      .then((result) => {
        if (!cancelled) {
          setData(result);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(errorMessage);
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, error, loading: data === undefined && error === '' };
}
