import { useParams } from 'react-router-dom';

/** PLACEHOLDER (Phase 2 · User). Route `/user/:id`. */
export function UserProfile() {
    const { id } = useParams<{ id: string }>();
    return (
        <div className="main-content placeholder" data-testid="user-profile-placeholder">
            <h2>UserProfile placeholder</h2>
            <p>
                user id: <strong data-testid="user-id">{id}</strong>
            </p>
        </div>
    );
}
