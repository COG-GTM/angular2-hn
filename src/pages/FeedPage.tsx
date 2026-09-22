import type { FeedName } from '../models';

export function FeedPage({ feedType }: { feedType: FeedName }) {
  return <div className="feed-placeholder">{feedType} feed</div>;
}
