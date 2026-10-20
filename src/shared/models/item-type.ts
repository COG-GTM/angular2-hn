/**
 * Item `type` as sent by node-hnapi. Angular named this `FeedType` (`feed-type.type.ts`); here `FeedType`
 * is the feed route name instead, so the item kind is `ItemType`.
 */
export type ItemType = 'poll' | 'story' | 'job' | 'link' | 'ask' | 'comment' | (string & {});
