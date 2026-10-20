import { QueryClient, useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { FeedType, Story, User } from '../models';
import { toPositiveInt } from './client';
import { ApiError } from './errors';
import { fetchFeed, fetchItemContent, fetchUser } from './hackernews-api';

export const queryKeys = {
    all: ['hn'] as const,
    feeds: () => [...queryKeys.all, 'feed'] as const,
    feed: (feedType: FeedType, page: number) => [...queryKeys.feeds(), feedType, page] as const,
    items: () => [...queryKeys.all, 'item'] as const,
    item: (id: number) => [...queryKeys.items(), id] as const,
    users: () => [...queryKeys.all, 'user'] as const,
    user: (id: string) => [...queryKeys.users(), id] as const,
};

const MAX_RETRIES = 2;

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

/** App-wide client used by `App.tsx`. Tests should use `createQueryClient()` / `renderWithProviders`. */
export const queryClient = createQueryClient();

/** Feed page. `page` may be the raw `:page` route param; anything but a positive integer → error state. */
export function useFeed(feedType: FeedType, page: number | string | undefined): UseQueryResult<Story[], Error> {
    const pageNumber = toPositiveInt(page);
    return useQuery({
        queryKey: queryKeys.feed(feedType, pageNumber),
        queryFn: ({ signal }) => fetchFeed(feedType, Number.isNaN(pageNumber) ? String(page) : pageNumber, signal),
    });
}

/** Item with comments (and resolved poll options). Invalid/NaN id → error state, never a disabled query. */
export function useItem(id: number | string | undefined): UseQueryResult<Story, Error> {
    const itemId = toPositiveInt(id);
    return useQuery({
        queryKey: queryKeys.item(itemId),
        queryFn: ({ signal }) => fetchItemContent(Number.isNaN(itemId) ? String(id) : itemId, signal),
    });
}

/** User profile from HNPWA. Unknown users (HTTP 200 with `null` or plain-text body) → error state. */
export function useUser(id: string | undefined): UseQueryResult<User, Error> {
    return useQuery({
        queryKey: queryKeys.user(id ?? ''),
        queryFn: ({ signal }) => fetchUser(id, signal),
    });
}
