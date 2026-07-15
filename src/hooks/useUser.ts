import { useEffect, useState } from 'react';
import { User } from '../models';
import { fetchUser } from '../api/hackernews';

export function useUser(
    id: string
): { user: User | null; loading: boolean; error: Error | null } {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError(null);
        fetchUser(id, controller.signal)
            .then((data) => {
                setUser(data);
                setLoading(false);
            })
            .catch((err: unknown) => {
                setError(err instanceof Error ? err : new Error(String(err)));
                setLoading(false);
            });
        return () => controller.abort();
    }, [id]);

    return { user, loading, error };
}
