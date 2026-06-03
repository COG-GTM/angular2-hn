// PLACEHOLDER — to be implemented in the migration child session for the User page.
// Parity target: src/app/user/user.component.{ts,html,scss} on the `master` branch.
import { useParams } from 'react-router-dom';

import { Loader } from '../components/Loader/Loader';

export function User() {
    const { id } = useParams<{ id: string }>();
    return (
        <div className="profile">
            <p>User placeholder: {id}</p>
            <Loader />
        </div>
    );
}
