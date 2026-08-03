import { useEffect, useState } from 'react';

export interface RequestState<T> {
    data: T | null;
    error: string;
}

/**
 * Runs an abortable request whenever its dependencies change and exposes the
 * resolved data alongside a display error message.
 */
export function useRequest<T>(
    request: (signal: AbortSignal) => Promise<T>,
    errorMessage: string,
    deps: unknown[],
    onSuccess?: () => void
): RequestState<T> {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        setData(null);
        setError('');

        request(controller.signal)
            .then((result) => {
                if (controller.signal.aborted) {
                    return;
                }
                setData(result);
                onSuccess?.();
            })
            .catch(() => {
                if (!controller.signal.aborted) {
                    setError(errorMessage);
                }
            });

        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return { data, error };
}
