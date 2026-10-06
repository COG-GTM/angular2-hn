import { useRouteId } from '../../hooks/useRouteId';

// Placeholder until item details are ported.
export default function ItemDetails() {
    const id = useRouteId();
    return <div className="main-content" data-item-id={id ?? ''}></div>;
}
