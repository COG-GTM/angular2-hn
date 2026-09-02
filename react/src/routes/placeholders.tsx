import { useParams } from 'react-router-dom';

import type { FeedName } from '../api/hackernews-api';

export interface FeedPageProps {
    feedType: FeedName;
}

export function FeedPlaceholder({ feedType }: FeedPageProps) {
    const { page } = useParams<{ page: string }>();
    return (
        <main data-testid="feed-page" data-feed-type={feedType} data-page={page}>
            {feedType} / page {page}
        </main>
    );
}

export function ItemPlaceholder() {
    const { id } = useParams<{ id: string }>();
    return <main data-testid="item-page">item {id}</main>;
}

export function UserPlaceholder() {
    const { id } = useParams<{ id: string }>();
    return <main data-testid="user-page">user {id}</main>;
}
