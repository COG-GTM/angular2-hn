import type { FeedName } from '../models';

export const queryKeys = {
  feed: (feedType: FeedName, page: number) => ['feed', feedType, page] as const,
  item: (id: number) => ['item', id] as const,
  user: (id: string) => ['user', id] as const,
};
