import { Story } from '../../models/story';

interface ItemProps {
  item: Story;
}

// Placeholder — implemented in the feed migration slice.
export default function Item({ item }: ItemProps) {
  return <div>{item.title}</div>;
}
