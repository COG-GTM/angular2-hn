import type { Story } from '../../models/story';
import './Item.scss';

interface ItemProps {
  item: Story;
}

// TODO(child-session): port ItemComponent template.
export default function Item({ item }: ItemProps) {
  return <div className="item-block">{item.title}</div>;
}
