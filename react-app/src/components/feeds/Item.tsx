// PLACEHOLDER (Phase 1 scaffold) - replaced by the Phase 2A port.
import type { Story } from '../../models/story';

export interface ItemProps {
    item: Story;
}

export default function Item({ item }: ItemProps) {
    return <div>{item.title}</div>;
}
