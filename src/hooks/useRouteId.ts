import { useParams, useSearchParams } from 'react-router-dom';

/** Reads an id from either `/:id` (Angular-style links) or `?id=` (HN-style links). */
export function useRouteId(): string | null {
    const { id } = useParams<{ id?: string }>();
    const [searchParams] = useSearchParams();
    return id ?? searchParams.get('id');
}
