import { useEffect, useState } from 'react';

export interface FetchState<T> {
    data: T | null;
    error: Error | null;
    loading: boolean;
}

function isAbortError(error: unknown): boolean {
    return error instanceof DOMException && error.name === 'AbortError';
}

export function useFetch<T>(
    fetcher: (signal: AbortSignal) => Promise<T>,
    deps: unknown[]
): FetchState<T> {
    const [state, setState] = useState<FetchState<T>>({
        data: null,
        error: null,
        loading: true,
    });

    // oxlint-disable-next-line react-hooks/exhaustive-deps -- deps are supplied by the caller
    useEffect(() => {
        const controller = new AbortController();
        let cancelled = false;
        setState({ data: null, error: null, loading: true });

        fetcher(controller.signal)
            .then((data) => {
                if (!cancelled) {
                    setState({ data, error: null, loading: false });
                }
            })
            .catch((error: unknown) => {
                if (cancelled || isAbortError(error)) {
                    return;
                }
                setState({
                    data: null,
                    error: error instanceof Error ? error : new Error(String(error)),
                    loading: false,
                });
            });

        return () => {
            cancelled = true;
            controller.abort();
        };
    }, deps);

    return state;
}
