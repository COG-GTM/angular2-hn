import { useRouteId } from '../../hooks/useRouteId';

// Placeholder until the user profile is ported.
export default function UserProfile() {
    const id = useRouteId();
    return <div className="profile" data-user-id={id ?? ''}></div>;
}
