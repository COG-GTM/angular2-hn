import { useEffect, useState } from 'react';

export interface AsyncState<T> {
    data: T | undefined;
    errorMessage: string;
}

/**
 * Runs `task` whenever `deps` change, aborting the in-flight request on change or
 * unmount. Previously loaded data is kept while the next request resolves, matching
 * how the Angular components re-used their view model across route parameter changes.
 */
export function useAsync<T>(
    task: (signal: AbortSignal) => Promise<T>,
    deps: unknown[],
    errorMessage: string
): AsyncState<T> {
    const [state, setState] = useState<AsyncState<T>>({ data: undefined, errorMessage: '' });

    useEffect(() => {
        const controller = new AbortController();

        task(controller.signal)
            .then((data) => {
                if (!controller.signal.aborted) {
                    setState({ data, errorMessage: '' });
                }
            })
            .catch(() => {
                if (!controller.signal.aborted) {
                    setState((current) => ({ ...current, errorMessage }));
                }
            });

        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return state;
}
