import { useParams } from 'react-router-dom';

import type { FeedName } from '../../models';

// Phase 0 placeholder. Phase 1 (feeds) ports src/app/feeds/feed/ + src/app/feeds/item/ here using useFeed().
export default function FeedPage({ feedType }: { feedType: FeedName }) {
  const { page } = useParams();
  const pageNum = page ? Number(page) : 1;
  return (
    <div className="main-content" data-testid="feed-page" data-feed-type={feedType} data-page={pageNum}>
      {feedType} — page {pageNum}
    </div>
  );
}
