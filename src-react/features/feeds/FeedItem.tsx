import type { Story } from '../../shared/models';

export interface FeedItemProps {
    item: Story;
}

/** PLACEHOLDER (Phase 2 · Feeds). One row of the feed list. */
export function FeedItem({ item }: FeedItemProps) {
    return (
        <div className="item placeholder" data-testid="feed-item-placeholder">
            FeedItem placeholder: {item.title}
        </div>
    );
}
