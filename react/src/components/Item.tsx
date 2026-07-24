import type { Story } from '../models';

interface ItemProps {
    item: Story;
}

function Item({ item }: ItemProps) {
    return <div>{item.title}</div>;
}

export default Item;
