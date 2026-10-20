import type { Story } from '../shared/models';
import './Item.scss';

interface ItemProps {
    item: Story;
}

/**
 * Foundation placeholder for the feed row (former `<item [item]>` component).
 * Track A replaces this with the ported `ItemComponent`.
 */
export function Item({ item }: ItemProps) {
    return (
        <div className="app-item">
            <p>
                <a className="title" href={item.url}>
                    {item.title}
                </a>
            </p>
        </div>
    );
}
