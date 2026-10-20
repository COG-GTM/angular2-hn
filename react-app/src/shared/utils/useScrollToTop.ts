import { useEffect } from 'react';

/**
 * `window.scrollTo(0, 0)` on mount and whenever `dep` changes. Call it in every route page keyed on
 * its route param(s) (e.g. `useScrollToTop(id)` or `useScrollToTop(`${feedType}/${page}`)`), before
 * any early return for loading/error states.
 */
export function useScrollToTop(dep: unknown): void {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [dep]);
}
