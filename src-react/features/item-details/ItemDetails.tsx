import { useParams } from 'react-router-dom';

/** PLACEHOLDER (Phase 2 · Item details). Route `/item/:id`. */
export function ItemDetails() {
    const { id } = useParams<{ id: string }>();
    return (
        <div className="main-content placeholder" data-testid="item-details-placeholder">
            <h2>ItemDetails placeholder</h2>
            <p>
                item id: <strong data-testid="item-id">{id}</strong>
            </p>
        </div>
    );
}
