import { FEED_NAMES } from '.';

describe('FEED_NAMES', () => {
    it('lists every HN feed in nav order', () => {
        expect(FEED_NAMES).toEqual(['news', 'newest', 'show', 'ask', 'jobs']);
    });
});
