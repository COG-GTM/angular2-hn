import { useParams } from 'react-router-dom';

// Placeholder route target; the user profile is implemented in migration phase 5.
export default function UserProfile() {
    const { id } = useParams();
    return (
        <div className="main-content" data-testid="user-profile" data-user-id={id}>
            <p>User {id}</p>
        </div>
    );
}
