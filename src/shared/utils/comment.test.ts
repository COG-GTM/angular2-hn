import { formatCommentCount } from './comment';

// Mirrors Angular `CommentPipe.transform`: `> 0` → "N comment(s)", anything else → "discuss".
describe('formatCommentCount', () => {
    it('returns "discuss" for zero, null or undefined', () => {
        expect(formatCommentCount(0)).toBe('discuss');
        expect(formatCommentCount(null)).toBe('discuss');
        expect(formatCommentCount(undefined)).toBe('discuss');
    });

    it('returns "discuss" for negative or NaN counts, like the `comment > 0` guard in the pipe', () => {
        expect(formatCommentCount(-1)).toBe('discuss');
        expect(formatCommentCount(Number.NaN)).toBe('discuss');
    });

    it('singularises exactly one comment', () => {
        expect(formatCommentCount(1)).toBe('1 comment');
    });

    it('pluralises every other positive count', () => {
        expect(formatCommentCount(2)).toBe('2 comments');
        expect(formatCommentCount(42)).toBe('42 comments');
        expect(formatCommentCount(1234)).toBe('1234 comments');
    });
});
