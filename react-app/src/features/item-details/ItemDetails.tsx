import { useParams } from 'react-router';

/** Placeholder — Item-details child ports Angular `item-details`. Reads `:id`. */
export function ItemDetails() {
    const { id } = useParams<{ id: string }>();
    return (
        <div className="placeholder" data-testid="item-details">
            ItemDetails placeholder: item {id}
        </div>
    );
}
