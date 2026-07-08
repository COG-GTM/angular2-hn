// Stub — replaced by the Feed/Item migration child session.
import { Story } from '../shared/models/story';

export function Item({ item }: { item: Story }) {
    return <div>{item.title}</div>;
}
