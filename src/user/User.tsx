import { useParams } from 'react-router-dom';

import './User.scss';

/**
 * Foundation placeholder for the lazy `/user/:id` route (former `UserModule`).
 * Track C replaces this with the ported `UserComponent`.
 */
export default function User() {
    const { id } = useParams<{ id: string }>();

    return (
        <div className="app-user">
            <div className="profile">User {id} — coming in Track C.</div>
        </div>
    );
}
