import { useParams } from 'react-router-dom';

import { Loader } from '../components/loader/Loader';

/**
 * Placeholder implemented in Phase 4c (UserComponent).
 */
export const User = () => {
    const { id } = useParams<{ id: string }>();

    return (
        <div className="main-content" data-user-id={id}>
            <Loader />
        </div>
    );
};
