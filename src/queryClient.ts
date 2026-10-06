import { QueryClient } from '@tanstack/react-query';

export function createQueryClient(): QueryClient {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 5 * 60 * 1000,
                retry: 1,
                refetchOnWindowFocus: false,
                // Still issue requests while offline so the service worker can answer from its cache.
                networkMode: 'offlineFirst',
            },
        },
    });
}
