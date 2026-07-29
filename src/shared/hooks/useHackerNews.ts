import { fetchFeed, fetchItemContent, fetchUser } from '../api/hackernewsApi';
import type { Story, User } from '../models';
import { useAsync, type AsyncState } from './useAsync';

export function useFeed(feedType: string, page: number): AsyncState<Story[]> {
    return useAsync<Story[]>((signal) => fetchFeed(feedType, page, signal), [feedType, page]);
}

export function useItem(id: number): AsyncState<Story> {
    return useAsync<Story>((signal) => fetchItemContent(id, signal), [id]);
}

export function useUser(id: string): AsyncState<User> {
    return useAsync<User>((signal) => fetchUser(id, signal), [id]);
}
