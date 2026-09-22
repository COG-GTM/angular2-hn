import { useEffect, useState } from 'react';

export interface FetchState<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
}

/**
 * Runs an abortable async request and keeps its state.
 * `deps` controls when the request re-runs; the in-flight request is aborted on cleanup.
 */
export function useFetch<T>(request: (signal: AbortSignal) => Promise<T>, deps: unknown[]): FetchState<T> {
    const [state, setState] = useState<FetchState<T>>({ data: null, loading: true, error: null });

    useEffect(() => {
        const controller = new AbortController();
        let active = true;

        setState({ data: null, loading: true, error: null });

        request(controller.signal)
            .then((data) => {
                if (active) {
                    setState({ data, loading: false, error: null });
                }
            })
            .catch((error: unknown) => {
                if (!active || controller.signal.aborted) {
                    return;
                }
                setState({
                    data: null,
                    loading: false,
                    error: error instanceof Error ? error : new Error(String(error)),
                });
            });

        return () => {
            active = false;
            controller.abort();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return state;
}
