import { useParams } from 'react-router-dom';

export function UserProfile() {
    const { id } = useParams();
    return <div className="main-content">User {id}</div>;
}
