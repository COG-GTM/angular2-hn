import { useParams } from 'react-router-dom';

import { FeedRoute } from '../shared/models';
import { useFeedPage } from './use-feed-page';

export function FeedPlaceholder({ feedType }: { feedType: FeedRoute }) {
    const page = useFeedPage();

    return (
        <div data-testid="feed">
            {feedType} feed page {page}
        </div>
    );
}

export function ItemDetailsPlaceholder() {
    const { id } = useParams();

    return <div data-testid="item">item {id}</div>;
}

export function UserPlaceholder() {
    const { id } = useParams();

    return <div data-testid="user">user {id}</div>;
}
