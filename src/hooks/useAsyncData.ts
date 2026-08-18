import { useEffect, useState } from 'react';

interface AsyncState<T> {
    key: string;
    data: T | null;
    error: string;
}

/**
 * Loads remote data for the given key, aborting the request when the key changes
 * or the component unmounts. Results from a previous key are never shown.
 */
export function useAsyncData<T>(key: string, load: (signal: AbortSignal) => Promise<T>, errorMessage: string) {
    const [state, setState] = useState<AsyncState<T>>({ key: '', data: null, error: '' });

    useEffect(() => {
        const controller = new AbortController();

        load(controller.signal)
            .then((data) => setState({ key, data, error: '' }))
            .catch((error: unknown) => {
                if (!controller.signal.aborted) {
                    console.error(error);
                    setState({ key, data: null, error: errorMessage });
                }
            });

        return () => controller.abort();
    }, [key, load, errorMessage]);

    const settled = state.key === key;

    return {
        data: settled ? state.data : null,
        error: settled ? state.error : '',
    };
}
