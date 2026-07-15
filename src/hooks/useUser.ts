import { User } from '../models';

// STUB (Task 0): real fetching/abort logic lands in the hooks task.
export function useUser(
    _id: string
): { user: User | null; loading: boolean; error: Error | null } {
    return { user: null, loading: false, error: null };
}
