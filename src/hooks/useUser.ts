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
        setUser(null);
        setError('');
        setLoading(true);

        fetchUser(id)
            .then((data) => {
                setUser(data);
                setLoading(false);
            })
            .catch(() => {
                setError(`Could not load user ${id}.`);
                setLoading(false);
            });
    }, [id]);

    return { user, error, loading };
}
