import type { FeedCategory } from '../types';

export interface FeedProps {
  feedType: FeedCategory;
}

// Placeholder — implemented in Phase 4.
export default function Feed({ feedType }: FeedProps) {
  return <div className="main-content" data-feed-type={feedType} />;
}
