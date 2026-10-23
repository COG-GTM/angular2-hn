import { useParams } from 'react-router-dom';

/** PLACEHOLDER (Phase 3 replaces): port of src/app/item-details. Rendered (lazily) at `/item/:id`. */
export function ItemDetailsPage() {
    const { id } = useParams();
    return <div data-testid="item-details-placeholder">{id}</div>;
}
