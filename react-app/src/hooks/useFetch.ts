import { useEffect, useRef, useState } from 'react';

import { isAbortError } from '../api';

export type FetchState<T> =
    | { status: 'loading'; data: undefined; error: undefined; stale?: T }
    | { status: 'success'; data: T; error: undefined }
    | { status: 'error'; data: undefined; error: unknown; stale?: T };

interface Settled<T> {
    key: string;
    state: FetchState<T>;
}

const LOADING = { status: 'loading', data: undefined, error: undefined } as const;

/**
 * Runs `fetcher(signal)` whenever `key` changes and aborts the previous request (Angular unsubscribed
 * from `lazyFetch`). A result only counts for the key it was fetched for, so changing the key shows
 * `loading` immediately (with the previous success as `stale`), and late results of aborted requests are
 * dropped. Route pages should include `useLocation().key` in `key` so every history entry refetches.
 */
export function useFetch<T>(fetcher: (signal: AbortSignal) => Promise<T>, key: string): FetchState<T> {
    const [settled, setSettled] = useState<Settled<T> | null>(null);
    const [lastSuccess, setLastSuccess] = useState<Settled<T> | null>(null);
    const fetcherRef = useRef(fetcher);

    useEffect(() => {
        fetcherRef.current = fetcher;
    });

    useEffect(() => {
        const controller = new AbortController();
        fetcherRef.current(controller.signal).then(
            (data) => {
                if (!controller.signal.aborted) {
                    const next: Settled<T> = { key, state: { status: 'success', data, error: undefined } };
                    setSettled(next);
                    setLastSuccess(next);
                }
            },
            (error: unknown) => {
                if (controller.signal.aborted || isAbortError(error)) return;
                setSettled({ key, state: { status: 'error', data: undefined, error } });
            }
        );
        return () => controller.abort();
    }, [key]);

    // `stale` is the last successful result for another key, for pages that keep it on screen while refetching.
    const stale =
        lastSuccess && lastSuccess.key !== key && lastSuccess.state.status === 'success'
            ? lastSuccess.state.data
            : undefined;
    if (settled && settled.key === key) {
        return settled.state.status === 'error' && stale !== undefined ? { ...settled.state, stale } : settled.state;
    }
    return stale !== undefined ? { ...LOADING, stale } : LOADING;
}
