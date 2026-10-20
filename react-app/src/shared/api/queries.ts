import { QueryClient, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useLocation } from 'react-router';

import type { FeedType, Story, User } from '../models';
import { ApiError } from './errors';
import { toPositiveInt } from './fetch-json';
import { fetchFeed, fetchItem, fetchUser } from './hackernews-api';

/** Hierarchical keys; prefixes (`queryKeys.all`, `queryKeys.items()`, …) work with `invalidateQueries`. */
export const queryKeys = {
    all: ['hn'] as const,
    feeds: () => [...queryKeys.all, 'feed'] as const,
    feed: (feedType: FeedType, page: number | string) => [...queryKeys.feeds(), feedType, page] as const,
    items: () => [...queryKeys.all, 'item'] as const,
    item: (id: number | string) => [...queryKeys.items(), id] as const,
    users: () => [...queryKeys.all, 'user'] as const,
    user: (id: string) => [...queryKeys.users(), id] as const,
};

/** Valid params key by number; invalid ones keep their raw text so each bad URL is its own (error) query. */
function paramKey(parsed: number, raw: number | string | undefined): number | string {
    return Number.isNaN(parsed) ? `invalid:${String(raw)}` : parsed;
}

const MAX_RETRIES = 2;

/** No retry for non-retryable `ApiError`s (invalid params, 4xx, not-found, bad bodies); else up to 2 retries. */
export function shouldRetry(failureCount: number, error: unknown): boolean {
    if (error instanceof ApiError && !error.retryable) return false;
    return failureCount < MAX_RETRIES;
}

export function createQueryClient(): QueryClient {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60_000,
                gcTime: 5 * 60_000,
                retry: shouldRetry,
                refetchOnWindowFocus: false,
            },
        },
    });
}

/**
 * Every history entry gets its own cache entry (React Router's `location.key` is appended to the key),
 * so `/user/a → /user/b → /user/a` (or Back) always shows the loader and refetches instead of showing a
 * previous resource as current — same as Angular, which refetched on every navigation.
 */
function useLocationKey(): string {
    return useLocation().key;
}

/** Feed page. `page` may be the raw `:page` param; anything but a positive integer → `isError` (never disabled). */
export function useFeed(feedType: FeedType, page: number | string | undefined): UseQueryResult<Story[], Error> {
    const locationKey = useLocationKey();
    const pageNumber = toPositiveInt(page);
    return useQuery({
        queryKey: [...queryKeys.feed(feedType, paramKey(pageNumber, page)), { locationKey }],
        queryFn: ({ signal }) => fetchFeed(feedType, Number.isNaN(pageNumber) ? String(page) : pageNumber, signal),
    });
}

/** Item with comments and resolved poll options. Invalid/NaN/unknown id → `isError` (never disabled). */
export function useItem(id: number | string | undefined): UseQueryResult<Story, Error> {
    const locationKey = useLocationKey();
    const itemId = toPositiveInt(id);
    return useQuery({
        queryKey: [...queryKeys.item(paramKey(itemId, id)), { locationKey }],
        queryFn: ({ signal }) => fetchItem(Number.isNaN(itemId) ? String(id) : itemId, signal),
    });
}

/** User profile from HNPWA. Blank or unknown users (200 + `null`/plain text) → `isError` (never disabled). */
export function useUser(id: string | undefined): UseQueryResult<User, Error> {
    const locationKey = useLocationKey();
    return useQuery({
        queryKey: [...queryKeys.user(id ?? ''), { locationKey }],
        queryFn: ({ signal }) => fetchUser(id, signal),
    });
}
