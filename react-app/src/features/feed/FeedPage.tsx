import type { FeedName } from '../../shared/models/feed-name.type';

interface FeedPageProps {
    feedType: FeedName;
}

export default function FeedPage({ feedType }: FeedPageProps) {
    return <div className="main-content" data-testid="feed-page" data-feed-type={feedType}></div>;
}
