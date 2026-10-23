import { useEffect } from 'react';

/**
 * `window.scrollTo(0, 0)` on mount and whenever `key` changes. Call it at the top of every route page, keyed
 * on its route params, before any early return for loading/error states.
 */
export function useScrollToTop(key: unknown): void {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [key]);
}
