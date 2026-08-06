import type { FeedType } from '../../models';

interface FeedPageProps {
  feedType: FeedType;
}

export default function FeedPage({ feedType }: FeedPageProps) {
  return <div id="content">{feedType}</div>;
}
