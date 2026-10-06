import { useParams } from 'react-router-dom';

// Placeholder route target; item details & comments are implemented in migration phase 4.
export default function ItemDetails() {
    const { id } = useParams();
    return (
        <div className="main-content" data-testid="item-details" data-item-id={id}>
            <p>Item {id}</p>
        </div>
    );
}
