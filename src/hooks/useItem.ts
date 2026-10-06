import { useQuery } from '@tanstack/react-query';
import { fetchItemContent } from '../api/hnApi';

export function useItem(id: number | null) {
    return useQuery({
        queryKey: ['item', id],
        queryFn: ({ signal }) => fetchItemContent(id as number, signal),
        enabled: id !== null,
    });
}
