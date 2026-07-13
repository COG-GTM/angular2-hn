import { useParams } from 'react-router-dom';

import { Loader } from '../components/loader/Loader';

/**
 * Placeholder implemented in Phase 4b (ItemDetailsComponent + recursive CommentComponent).
 */
export const ItemDetails = () => {
    const { id } = useParams<{ id: string }>();

    return (
        <div className="main-content" data-item-id={id}>
            <Loader />
        </div>
    );
};
