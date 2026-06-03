// PLACEHOLDER — to be implemented in the migration child session for the Item details page.
// Parity target: src/app/item-details/item-details.component.{ts,html,scss}
// and src/app/item-details/comment/comment.component.{ts,html,scss} on the `master` branch.
import { useParams } from 'react-router-dom';

import { Loader } from '../components/Loader/Loader';

export function ItemDetails() {
    const { id } = useParams<{ id: string }>();
    return (
        <div className="main-content">
            <p>Item details placeholder: {id}</p>
            <Loader />
        </div>
    );
}
