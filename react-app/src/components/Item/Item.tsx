import type { Story } from '../../models';

interface ItemProps {
  item: Story;
}

export default function Item({ item }: ItemProps) {
  return <div>{item.title}</div>;
}
