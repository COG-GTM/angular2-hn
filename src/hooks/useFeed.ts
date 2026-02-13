import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { Story } from './types';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

async function fetchFeed(feedType: string, page: number): Promise<Story[]> {
    const response = await fetch(`${BASE_URL}/${feedType}?page=${page}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch feed: ${response.statusText}`);
    }
    return response.json();
}

export function useFeed(feedType: string, page: number): UseQueryResult<Story[]> {
    return useQuery({
        queryKey: ['feed', feedType, page],
        queryFn: () => fetchFeed(feedType, page),
    });
}
