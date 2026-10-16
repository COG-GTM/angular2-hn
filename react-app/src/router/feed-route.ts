import { useMatches, useParams } from 'react-router';

import type { Feed } from '../shared/models';

export interface FeedRouteHandle {
    feedType: Feed;
}

function isFeedHandle(handle: unknown): handle is FeedRouteHandle {
    return typeof handle === 'object' && handle !== null && 'feedType' in handle;
}

// Equivalent of `this.route.data.feedType` in the Angular FeedComponent.
export function useFeedType(): Feed {
    const match = useMatches()
        .map((m) => m.handle)
        .reverse()
        .find(isFeedHandle);
    if (!match) {
        throw new Error('useFeedType must be used inside a feed route');
    }
    return match.feedType;
}

// Equivalent of `params['page'] ? +params['page'] : 1`.
export function usePageNumber(): number {
    const { page } = useParams();
    const n = page ? Number(page) : 1;
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}
