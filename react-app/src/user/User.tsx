import { useParams } from 'react-router';

// Placeholder: ported by the user profile workstream (src/app/user).
export function User() {
    const { id } = useParams();
    return <div className="main-content">user {id}</div>;
}
