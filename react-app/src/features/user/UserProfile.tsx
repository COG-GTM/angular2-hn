import { useParams } from 'react-router';

/** Placeholder — User child ports Angular `user`. Reads `:id`. */
export function UserProfile() {
    const { id } = useParams<{ id: string }>();
    return (
        <div className="placeholder" data-testid="user-profile">
            UserProfile placeholder: user {id}
        </div>
    );
}
