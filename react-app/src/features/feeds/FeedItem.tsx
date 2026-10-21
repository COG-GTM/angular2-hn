import type { Story } from '../../shared/models';

export interface FeedItemProps {
    item: Story;
}

/** Placeholder — Feeds child ports Angular `feeds/item`. */
export function FeedItem({ item }: FeedItemProps) {
    return <div data-testid="feed-item">FeedItem placeholder: {item.title}</div>;
}
