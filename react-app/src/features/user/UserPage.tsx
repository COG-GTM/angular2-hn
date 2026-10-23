import { useParams } from 'react-router-dom';

/** PLACEHOLDER (Phase 4 replaces): port of src/app/user. Rendered (lazily) at `/user/:id`. */
export function UserPage() {
    const { id } = useParams();
    return <div data-testid="user-page-placeholder">{id}</div>;
}
