import { useEffect, useState } from 'react';
import { Story } from '../models';
import { fetchItem } from '../api/hackernews';

export function useItem(
    id: number
): { item: Story | null; loading: boolean; error: Error | null } {
    const [item, setItem] = useState<Story | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError(null);
        fetchItem(id, controller.signal)
            .then((data) => {
                setItem(data);
                setLoading(false);
            })
            .catch((err: unknown) => {
                setError(err instanceof Error ? err : new Error(String(err)));
                setLoading(false);
            });
        return () => controller.abort();
    }, [id]);

    return { item, loading, error };
}
