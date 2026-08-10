import type { Story } from '../../shared/models/story';

// Placeholder replaced by the ItemComponent migration workstream.
export default function Item({ item }: { item: Story }) {
    return <div>{item.title}</div>;
}
