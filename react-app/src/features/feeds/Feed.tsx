import type { FeedType } from '../../api/types';

// Placeholder: ported in the feeds track.
export function Feed({ feedType }: { feedType: FeedType }) {
  return <div className="main-content" data-feed={feedType}></div>;
}
