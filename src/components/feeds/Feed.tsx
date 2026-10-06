import type { FeedName } from '../../models';

export interface FeedProps {
    feedType: FeedName;
    page: number;
}

// Placeholder until the feed list is ported.
export function Feed({ feedType, page }: FeedProps) {
    return <div className="main-content" data-feed-type={feedType} data-page={page}></div>;
}
