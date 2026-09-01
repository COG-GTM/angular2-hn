import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { fetchFeed, fetchItemContent, fetchUser } from '../api/hackernews';
import type { FeedType } from '../models/feed-type.type';
import type { Story } from '../models/story';
import type { User } from '../models/user';

export function useFeed(feedType: FeedType | string, page: number): UseQueryResult<Story[], Error> {
    return useQuery({
        queryKey: ['feed', feedType, page],
        queryFn: ({ signal }) => fetchFeed(feedType, page, signal),
    });
}

export function useItem(id: number): UseQueryResult<Story, Error> {
    return useQuery({
        queryKey: ['item', id],
        queryFn: ({ signal }) => fetchItemContent(id, signal),
        enabled: Number.isFinite(id),
    });
}

export function useUser(id: string): UseQueryResult<User, Error> {
    return useQuery({
        queryKey: ['user', id],
        queryFn: ({ signal }) => fetchUser(id, signal),
        enabled: Boolean(id),
    });
}
