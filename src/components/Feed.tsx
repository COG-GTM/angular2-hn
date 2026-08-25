import { FeedName } from '../models/feed-name.type';

export interface FeedProps {
    feedType: FeedName;
}

export function Feed({ feedType }: FeedProps) {
    return <div>Feed: {feedType}</div>;
}
