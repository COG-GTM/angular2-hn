import { formatCommentCount } from './comment-count';

describe('formatCommentCount', () => {
    it('returns "discuss" for zero', () => {
        expect(formatCommentCount(0)).toBe('discuss');
    });

    it('returns the singular form for one comment', () => {
        expect(formatCommentCount(1)).toBe('1 comment');
    });

    it('returns the plural form for more than one comment', () => {
        expect(formatCommentCount(2)).toBe('2 comments');
    });

    it('returns "discuss" for undefined', () => {
        expect(formatCommentCount(undefined)).toBe('discuss');
    });

    it('returns "discuss" for a negative count', () => {
        expect(formatCommentCount(-1)).toBe('discuss');
    });

    it('handles large counts', () => {
        expect(formatCommentCount(1234)).toBe('1234 comments');
    });
});
