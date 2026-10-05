import { useQuery } from '@tanstack/react-query';

import type { FeedName } from '../models';
import { fetchFeed, fetchItemContent, fetchUser } from './client';
import { queryKeys } from './queryKeys';

export function useFeed(feedType: FeedName, page: number) {
  return useQuery({
    queryKey: queryKeys.feed(feedType, page),
    queryFn: ({ signal }) => fetchFeed(feedType, page, signal),
  });
}

export function useItem(id: number) {
  return useQuery({
    queryKey: queryKeys.item(id),
    queryFn: ({ signal }) => fetchItemContent(id, signal),
    enabled: Number.isFinite(id),
  });
}

export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.user(id ?? ''),
    queryFn: ({ signal }) => fetchUser(id as string, signal),
    enabled: !!id,
  });
}
