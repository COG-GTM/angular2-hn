import { useState, useEffect, useCallback } from 'react';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(url: string | null): UseApiState<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: !!url,
    error: null,
  });

  useEffect(() => {
    if (!url) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    let cancelled = false;

    const fetchData = async () => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await fetch(`${BASE_URL}${url}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (!cancelled) {
          setState({ data, loading: false, error: null });
        }
      } catch (err) {
        if (!cancelled) {
          setState({
            data: null,
            loading: false,
            error: err instanceof Error ? err.message : 'An error occurred',
          });
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [url]);

  return state;
}

export function useFetch<T>(): {
  data: T | null;
  loading: boolean;
  error: string | null;
  fetchData: (url: string) => Promise<T | null>;
} {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchData = useCallback(async (url: string): Promise<T | null> => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(`${BASE_URL}${url}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setState({ data, loading: false, error: null });
      return data;
    } catch (err) {
      setState({
        data: null,
        loading: false,
        error: err instanceof Error ? err.message : 'An error occurred',
      });
      return null;
    }
  }, []);

  return { ...state, fetchData };
}
