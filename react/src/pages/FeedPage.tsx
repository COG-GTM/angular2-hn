// OWNER: Session 2 (feeds). Stub — port src/app/feeds/feed (list, pagination) + feeds/item (FeedItem).
import { useParams } from 'react-router-dom';
import type { FeedType } from '../api/types';

export function FeedPage({ feedType }: { feedType: FeedType }) {
  const { page } = useParams();
  return (
    <div className="app-feed">
      <div className="main-content">
        TODO feed {feedType} page {page}
      </div>
    </div>
  );
}
