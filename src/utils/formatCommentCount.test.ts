import { formatCommentCount } from './formatCommentCount';

describe('formatCommentCount', () => {
    it('returns discuss when there are no comments', () => {
        expect(formatCommentCount(0)).toBe('discuss');
    });

    it('returns a singular label for one comment', () => {
        expect(formatCommentCount(1)).toBe('1 comment');
    });

    it('returns a plural label for several comments', () => {
        expect(formatCommentCount(12)).toBe('12 comments');
    });
});
