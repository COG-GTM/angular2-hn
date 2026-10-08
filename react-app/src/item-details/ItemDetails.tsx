import { useParams } from 'react-router';

// Placeholder: ported by the item details + comments workstream (src/app/item-details).
export function ItemDetails() {
    const { id } = useParams();
    return <div className="main-content">item {id}</div>;
}
