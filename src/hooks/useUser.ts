import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { User } from './types';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

async function fetchUser(id: string): Promise<User> {
    const response = await fetch(`${BASE_URL}/user/${id}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.statusText}`);
    }
    return response.json();
}

export function useUser(id: string): UseQueryResult<User> {
    return useQuery({
        queryKey: ['user', id],
        queryFn: () => fetchUser(id),
        enabled: id.length > 0,
    });
}
