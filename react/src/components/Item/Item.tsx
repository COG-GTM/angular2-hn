import type { Story } from '../../models/story';

export function Item({ item }: { item: Story }) {
  return <li className="item">{item.title}</li>;
}

export default Item;
