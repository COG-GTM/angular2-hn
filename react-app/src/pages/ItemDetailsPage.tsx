import { useParams } from 'react-router-dom';

// Placeholder: ported from item-details + comment in the item details PR.
export default function ItemDetailsPage() {
    const { id } = useParams();
    return (
        <div className="main-content" data-testid="item-page">
            item {id}
        </div>
    );
}
