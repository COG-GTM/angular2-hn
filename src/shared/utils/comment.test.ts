import { formatCommentCount } from './comment';

describe('formatCommentCount', () => {
    it('returns "discuss" when there are no comments', () => {
        expect(formatCommentCount(0)).toBe('discuss');
    });

    it('uses the singular for one comment', () => {
        expect(formatCommentCount(1)).toBe('1 comment');
    });

    it('uses the plural for many comments', () => {
        expect(formatCommentCount(12)).toBe('12 comments');
    });
});
