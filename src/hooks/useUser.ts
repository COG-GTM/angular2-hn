import { useState, useEffect } from 'react';
import { User } from '../types/user';
import { fetchUser } from '../services/hackerNewsApi';

interface UseUserResult {
    user: User | null;
    error: string;
    loading: boolean;
}

export function useUser(id: string): UseUserResult {
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setUser(null);
        setError('');
        setLoading(true);

        fetchUser(id)
            .then((data) => {
                if (!cancelled) {
                    setUser(data);
                    setLoading(false);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setError(`Could not load user ${id}.`);
                    setLoading(false);
                }
            });

        return () => { cancelled = true; };
    }, [id]);

    return { user, error, loading };
}
