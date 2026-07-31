import { useEffect, useState } from 'react';

interface ApiRequestState<T> {
    data: T | null;
    error: string;
}

/**
 * Runs a request whenever its dependencies change, aborting the in-flight
 * request when they change again or the component unmounts.
 */
export function useApiRequest<T>(
    request: (signal: AbortSignal) => Promise<T>,
    errorMessage: string,
    dependencies: unknown[]
): ApiRequestState<T> {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const controller = new AbortController();

        setData(null);
        setError('');

        request(controller.signal)
            .then((result) => setData(result))
            .catch((requestError: unknown) => {
                if (requestError instanceof DOMException && requestError.name === 'AbortError') {
                    return;
                }
                setError(errorMessage);
            });

        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies);

    return { data, error };
}
