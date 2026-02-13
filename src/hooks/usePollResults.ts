import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { PollResult } from './types';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

async function fetchPollResults(id: number): Promise<PollResult> {
    const response = await fetch(`${BASE_URL}/item/${id}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch poll results: ${response.statusText}`);
    }
    return response.json();
}

export function usePollResults(id: number): UseQueryResult<PollResult> {
    return useQuery({
        queryKey: ['pollResults', id],
        queryFn: () => fetchPollResults(id),
        enabled: id > 0,
    });
}
