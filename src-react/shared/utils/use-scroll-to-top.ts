import { useEffect } from 'react';

/**
 * Scrolls the window to the top whenever `dep` changes (and on mount). Call it in every route page,
 * keyed on the route param, before any early return for loading/error states.
 */
export function useScrollToTop(dep: unknown): void {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [dep]);
}
