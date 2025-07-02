import { useEffect, useRef, useState } from 'react';

export function useLazyFetch<T>(url: string, options?: RequestInit) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const cancelTokenRef = useRef<boolean>(false);

  useEffect(() => {
    if (!url) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      cancelTokenRef.current = false;

      try {
        const response = await fetch(url, options);
        
        if (!cancelTokenRef.current) {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const result = await response.json();
          
          if (!cancelTokenRef.current) {
            setData(result);
          }
        }
      } catch (err) {
        if (!cancelTokenRef.current) {
          setError(err instanceof Error ? err : new Error('An error occurred'));
        }
      } finally {
        if (!cancelTokenRef.current) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelTokenRef.current = true;
    };
  }, [url, options]);

  const refetch = () => {
    if (url) {
      setData(null);
      setError(null);
    }
  };

  return { data, loading, error, refetch };
}

export function lazyFetch<T>(url: string, options?: RequestInit): Promise<T> {
  return new Promise((resolve, reject) => {
    let cancelToken = false;
    
    fetch(url, options)
      .then(res => {
        if (!cancelToken) {
          return res.json()
            .then(data => {
              if (!cancelToken) {
                resolve(data);
              }
            });
        }
      })
      .catch(err => {
        if (!cancelToken) {
          reject(err);
        }
      });

    return () => {
      cancelToken = true;
    };
  });
}
