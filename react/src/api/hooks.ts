import { useEffect, useState } from 'react';

import type { Story, User } from '../models';
import { fetchFeed, fetchItemContent, fetchUser } from './hackerNewsApi';

export interface AsyncState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

const initialState = { data: null, loading: true, error: null };

function useAsync<T>(load: (signal: AbortSignal) => Promise<T>, deps: unknown[]): AsyncState<T> {
    const [state, setState] = useState<AsyncState<T>>(initialState);

    useEffect(() => {
        const controller = new AbortController();
        setState(initialState);

        load(controller.signal)
            .then((data) => {
                if (!controller.signal.aborted) {
                    setState({ data, loading: false, error: null });
                }
            })
            .catch((error: unknown) => {
                if (controller.signal.aborted) {
                    return;
                }
                setState({ data: null, loading: false, error: error instanceof Error ? error.message : String(error) });
            });

        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return state;
}

export function useFeed(feedType: string, page: number): AsyncState<Story[]> {
    return useAsync((signal) => fetchFeed(feedType, page, signal), [feedType, page]);
}

export function useItem(id: number): AsyncState<Story> {
    return useAsync((signal) => fetchItemContent(id, signal), [id]);
}

export function useUser(id: string): AsyncState<User> {
    return useAsync((signal) => fetchUser(id, signal), [id]);
}
