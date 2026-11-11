import { useParams } from 'react-router-dom';

// Placeholder: ported from user in the user profile PR.
export default function UserPage() {
    const { id } = useParams();
    return (
        <div className="main-content" data-testid="user-page">
            user {id}
        </div>
    );
}
