import { useParams } from 'react-router-dom';

import { useItem } from '../api';

/** Placeholder item page: the ported item-details/comment components land in their own PRs. */
export function ItemDetailsPage() {
    const { id } = useParams();
    const { data, error, loading } = useItem(Number(id));

    if (loading) {
        return <div role="status">Loading</div>;
    }
    if (error) {
        return <div role="alert">{error}</div>;
    }

    return <article>{data?.title}</article>;
}
