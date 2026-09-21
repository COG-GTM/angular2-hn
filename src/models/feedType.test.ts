import { describe, expect, it } from 'vitest';

import { FEED_TYPES, isFeedType } from './feedType';

describe('isFeedType', () => {
    it('accepts every supported feed type', () => {
        expect(FEED_TYPES).toEqual(['news', 'newest', 'show', 'ask', 'jobs']);
        FEED_TYPES.forEach((feedType) => expect(isFeedType(feedType)).toBe(true));
    });

    it('rejects unknown values', () => {
        expect(isFeedType('story')).toBe(false);
        expect(isFeedType(undefined)).toBe(false);
    });
});
