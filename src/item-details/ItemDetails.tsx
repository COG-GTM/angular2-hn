import { useParams } from 'react-router-dom';

import './ItemDetails.scss';

/**
 * Foundation placeholder for the lazy `/item/:id` route (former `ItemDetailsModule`).
 * Track B replaces this with the ported `ItemDetailsComponent` and recursive `Comment`.
 */
export default function ItemDetails() {
    const { id } = useParams<{ id: string }>();

    return (
        <div className="app-item-details">
            <div className="main-content">
                <div className="item">Item {id} — coming in Track B.</div>
            </div>
        </div>
    );
}
