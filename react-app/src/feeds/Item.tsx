import type { Story } from '../shared/models';

// Placeholder: ported by the feeds workstream (src/app/feeds/item).
export function Item({ item }: { item: Story }) {
    return <span>{item.title}</span>;
}
