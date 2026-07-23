// Stub — replaced in Phase 5d with the ported item feed-row component.
import type { Story } from '../models';

interface ItemProps {
    item: Story;
}

function Item({ item }: ItemProps) {
    return <div className="app-item item-block">{item.title}</div>;
}

export default Item;
