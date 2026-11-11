import { useParams } from 'react-router-dom';
import type { FeedType } from '../models';

// TODO: Port the feed list and pagination in a later phase.
export function FeedPage({ feedType }: { feedType: FeedType }) {
  const { page } = useParams();
  return <h2>Feed: {feedType}, page: {page}</h2>;
}
