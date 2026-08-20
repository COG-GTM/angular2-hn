import { useEffect, useState } from 'react';

interface AsyncDataState<T> {
    data: T | undefined;
    errorMessage: string;
}

export function useAsyncData<T>(
    loader: (signal: AbortSignal) => Promise<T>,
    cacheKey: string,
    errorMessage: string
): AsyncDataState<T> {
    const [data, setData] = useState<T | undefined>(undefined);
    const [error, setError] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        setData(undefined);
        setError('');
        loader(controller.signal)
            .then((result) => setData(result))
            .catch((cause: unknown) => {
                if (!(cause instanceof DOMException && cause.name === 'AbortError')) {
                    setError(errorMessage);
                }
            });
        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cacheKey]);

    return { data, errorMessage: error };
}
