import { FeedType } from '../models/feed-type.type';

// STUB — to be implemented by the "feeds" migration session.
// Owns: src/pages/Feed.tsx, src/pages/Feed.scss, src/components/FeedItem.tsx, src/components/FeedItem.scss
export interface FeedProps {
    feedType: string;
}

export default function Feed({ feedType }: FeedProps) {
    return <div className="news-view">Feed stub: {feedType}</div>;
}

export type { FeedType };
