import { formatCommentCount } from './comment-format';

describe('formatCommentCount', () => {
    it('pluralises when more than one comment', () => {
        expect(formatCommentCount(2)).toBe('2 comments');
        expect(formatCommentCount(30)).toBe('30 comments');
    });

    it('uses the singular for exactly one comment', () => {
        expect(formatCommentCount(1)).toBe('1 comment');
    });

    it('returns "discuss" for zero or missing comments', () => {
        expect(formatCommentCount(0)).toBe('discuss');
        expect(formatCommentCount(-1)).toBe('discuss');
        expect(formatCommentCount(undefined as unknown as number)).toBe('discuss');
    });
});
