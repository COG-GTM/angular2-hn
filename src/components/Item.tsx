import { Story } from '../models/story';

export interface ItemProps {
    item: Story;
}

export function Item({ item }: ItemProps) {
    return <div>Item: {item.title}</div>;
}
