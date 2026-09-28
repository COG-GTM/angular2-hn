import { useEffect, useState } from 'react';

import { fetchFeed, fetchItem, fetchUser, listStartForPage } from './client';
import type { FeedType, Story, User } from './types';

export interface AsyncResource<T> {
    data: T | undefined;
    error: string;
    loading: boolean;
}

interface KeyedState<T> extends AsyncResource<T> {
    key: string;
}

const PENDING = { data: undefined, error: '', loading: true };

function useAsyncResource<T>(load: (signal: AbortSignal) => Promise<T>, errorMessage: string, deps: unknown[]) {
    const key = JSON.stringify(deps);
    const [state, setState] = useState<KeyedState<T>>({ ...PENDING, key });

    useEffect(() => {
        const controller = new AbortController();
        setState({ ...PENDING, key });
        load(controller.signal).then(
            (data) => {
                if (!controller.signal.aborted) {
                    setState({ data, error: '', loading: false, key });
                }
            },
            () => {
                if (!controller.signal.aborted) {
                    setState({ data: undefined, error: errorMessage, loading: false, key });
                }
            }
        );
        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    // The effect that resets state runs after the render that changed the deps,
    // so a resource from the previous key must not be reported as this one's.
    return state.key === key ? state : PENDING;
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
