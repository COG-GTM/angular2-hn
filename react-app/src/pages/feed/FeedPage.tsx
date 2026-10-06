import type { FeedType } from '../../types';

// Placeholder: ported in Phase 2 (Task A) from src/app/feeds/feed.
export function FeedPage({ feedType }: { feedType: FeedType }) {
  return <div className="main-content">Feed: {feedType}</div>;
}
