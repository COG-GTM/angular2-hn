import { Story } from '../models';

// STUB (Task 0): real fetching/abort logic lands in the hooks task.
export function useFeed(
    _feedType: string,
    _page: number
): { stories: Story[]; loading: boolean; error: Error | null } {
    return { stories: [], loading: false, error: null };
}
