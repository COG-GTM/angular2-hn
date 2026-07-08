import { useEffect, useState } from 'react';

import { fetchUser } from '../services/hackernewsApi';
import type { User } from '../models';

interface UserResult {
    id: string;
    user?: User;
    errorMessage: string;
}

interface UserState {
    user?: User;
    errorMessage: string;
}

export function useUser(id: string): UserState {
    const [result, setResult] = useState<UserResult>();

    useEffect(() => {
        let cancelled = false;

        fetchUser(id)
            .then((data) => {
                if (!cancelled) {
                    setResult({ id, user: data, errorMessage: '' });
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setResult({
                        id,
                        errorMessage: 'Could not load user ' + id + '.',
                    });
                }
            });

        return () => {
            cancelled = true;
        };
    }, [id]);

    const current = result && result.id === id ? result : undefined;

    return {
        user: current?.user,
        errorMessage: current?.errorMessage ?? '',
    };
}
