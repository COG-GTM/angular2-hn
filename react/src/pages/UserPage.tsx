import { useParams } from 'react-router-dom';

import { useUser } from '../api';

/** Placeholder user page: the ported user component lands in its own PR. */
export function UserPage() {
    const { id } = useParams();
    const { data, error, loading } = useUser(id ?? '');

    if (loading) {
        return <div role="status">Loading</div>;
    }
    if (error) {
        return <div role="alert">{error}</div>;
    }

    return <section>{data?.id}</section>;
}
