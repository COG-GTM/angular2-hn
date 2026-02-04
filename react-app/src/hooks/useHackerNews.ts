import { useQuery } from '@tanstack/react-query';
import { fetchFeed, fetchItemContent, fetchUser } from '../services/hackerNewsApi';
import { Story, User, FeedRouteType } from '../types';

/**
 * Hook to fetch a feed of stories
 * @param feedType - The type of feed (news, newest, show, ask, jobs)
 * @param page - The page number for pagination
 */
export function useFeed(feedType: FeedRouteType, page: number) {
  return useQuery<Story[], Error>({
    queryKey: ['feed', feedType, page],
    queryFn: () => fetchFeed(feedType, page),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single item's content
 * @param id - The item ID
 */
export function useItem(id: number) {
  return useQuery<Story, Error>({
    queryKey: ['item', id],
    queryFn: () => fetchItemContent(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: id > 0,
  });
}

/**
 * Hook to fetch user data
 * @param id - The user ID (username)
 */
export function useUser(id: string) {
  return useQuery<User, Error>({
    queryKey: ['user', id],
    queryFn: () => fetchUser(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!id,
  });
}
