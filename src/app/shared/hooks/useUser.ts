import { useState, useEffect } from 'react';
import { User } from '../models/user';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

export function useUser(id: string) {
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setUser(null);
        setError(null);
        const controller = new AbortController();

        fetch(`${BASE_URL}/user/${id}`, { signal: controller.signal })
            .then((res) => res.json())
            .then((data: User) => {
                setUser(data);
            })
            .catch((err) => {
                if (err.name !== 'AbortError') {
                    setError('Could not load user ' + id + '.');
                }
            });

        return () => controller.abort();
    }, [id]);

    return { user, error };
}
