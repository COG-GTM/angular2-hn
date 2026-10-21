import { useParams } from 'react-router-dom';

import type { FeedType } from '../../models';

export interface FeedPageProps {
  feedType: FeedType;
}

/** Placeholder: ported by the "feeds" session (src/app/feeds). */
export default function FeedPage({ feedType }: FeedPageProps) {
  const { page } = useParams<{ page: string }>();
  return <div className="main-content" data-feed-type={feedType} data-page={page} />;
}
