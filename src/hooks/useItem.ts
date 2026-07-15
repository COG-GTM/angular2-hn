import { Story } from '../models';

// STUB (Task 0): real fetching/abort logic lands in the hooks task.
export function useItem(
    _id: number
): { item: Story | null; loading: boolean; error: Error | null } {
    return { item: null, loading: false, error: null };
}
