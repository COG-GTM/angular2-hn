import { formatCommentCount } from './comment';

describe('formatCommentCount', () => {
    it('returns "discuss" for zero, null or undefined', () => {
        expect(formatCommentCount(0)).toBe('discuss');
        expect(formatCommentCount(null)).toBe('discuss');
        expect(formatCommentCount(undefined)).toBe('discuss');
    });

    it('singularises one comment', () => {
        expect(formatCommentCount(1)).toBe('1 comment');
    });

    it('pluralises many comments', () => {
        expect(formatCommentCount(42)).toBe('42 comments');
    });
});
