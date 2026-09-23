import { useEffect, useState } from 'react';

import { fetchFeed, fetchItem, fetchUser, listStartForPage } from './client';
import type { FeedType, Story, User } from './types';

export interface AsyncResource<T> {
    data: T | undefined;
    error: string;
    loading: boolean;
}

function useAsyncResource<T>(load: (signal: AbortSignal) => Promise<T>, errorMessage: string, deps: unknown[]) {
    const [state, setState] = useState<AsyncResource<T>>({ data: undefined, error: '', loading: true });

    useEffect(() => {
        const controller = new AbortController();
        setState({ data: undefined, error: '', loading: true });
        load(controller.signal).then(
            (data) => {
                if (!controller.signal.aborted) {
                    setState({ data, error: '', loading: false });
                }
            },
            () => {
                if (!controller.signal.aborted) {
                    setState({ data: undefined, error: errorMessage, loading: false });
                }
            }
        );
        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return state;
}

export interface FeedResource extends AsyncResource<Story[]> {
    listStart: number;
}

export function useFeed(feedType: FeedType, page: number): FeedResource {
    const resource = useAsyncResource<Story[]>(
        (signal) => fetchFeed(feedType, page, signal),
        `Could not load ${feedType} stories.`,
        [feedType, page]
    );

    useEffect(() => {
        if (resource.data) {
            window.scrollTo(0, 0);
        }
    }, [resource.data]);

    return { ...resource, listStart: listStartForPage(page) };
}

export function useItem(id: number): AsyncResource<Story> {
    return useAsyncResource<Story>((signal) => fetchItem(id, signal), 'Could not load item comments.', [id]);
}

export function useUser(id: string): AsyncResource<User> {
    return useAsyncResource<User>((signal) => fetchUser(id, signal), `Could not load user ${id}.`, [id]);
}
