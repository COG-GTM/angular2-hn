/*
 * ROUTE SLOT — owned by T3 (Feeds).
 * The route table (routes/routes.tsx) renders `<FeedSlot feed=… />` for every
 * feed path; the page number comes from `?page=n`.
 */
import { FeedPage, type FeedPageProps } from '../../pages/FeedPage';

export type FeedSlotProps = FeedPageProps;

export function FeedSlot({ feed }: FeedSlotProps) {
  return <FeedPage feed={feed} />;
}
