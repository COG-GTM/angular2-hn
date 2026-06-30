import { Story } from '../../models/story';
import './Item.scss';

interface ItemProps {
    item: Story;
}

// STUB — implemented by a child session.
export default function Item({ item }: ItemProps) {
    return <div>{item.title}</div>;
}
