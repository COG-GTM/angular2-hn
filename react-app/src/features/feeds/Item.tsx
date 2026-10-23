import type { Story } from '../../types';

export interface ItemProps {
    item: Story;
}

/** PLACEHOLDER (Phase 2 replaces): port of src/app/feeds/item. */
export function Item({ item }: ItemProps) {
    return <div data-testid="item-placeholder">{item.title}</div>;
}
