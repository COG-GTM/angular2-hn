import { useEffect, useState } from 'react';

interface ApiRequestState<T> {
    data: T | null;
    error: string;
}

interface KeyedState<T> extends ApiRequestState<T> {
    key: string;
}

const PENDING = { data: null, error: '' };

/**
 * Runs a request whenever its dependencies change, aborting the in-flight
 * request when they change again or the component unmounts.
 *
 * `dependencies` identifies the request, so it must list every value the
 * `request` closure reads (feed type, page, item id, ...) and must be
 * JSON-serialisable; results resolved for other dependencies read as pending.
 */
export function useApiRequest<T>(
    request: (signal: AbortSignal) => Promise<T>,
    errorMessage: string,
    dependencies: unknown[]
): ApiRequestState<T> {
    const key = JSON.stringify(dependencies);
    const [state, setState] = useState<KeyedState<T>>({ key, ...PENDING });

    useEffect(() => {
        const controller = new AbortController();

        request(controller.signal)
            .then((data) => setState({ key, data, error: '' }))
            .catch((requestError: unknown) => {
                if (requestError instanceof Error && requestError.name === 'AbortError') {
                    return;
                }
                setState({ key, data: null, error: errorMessage });
            });

        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    return state.key === key ? { data: state.data, error: state.error } : PENDING;
}
