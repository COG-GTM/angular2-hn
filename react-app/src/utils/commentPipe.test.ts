import { describe, expect, it } from 'vitest';
import { formatCommentCount } from './commentPipe';

describe('formatCommentCount', () => {
    it('returns "discuss" when there are no comments', () => {
        expect(formatCommentCount(0)).toBe('discuss');
    });

    it('uses singular form for exactly one comment', () => {
        expect(formatCommentCount(1)).toBe('1 comment');
    });

    it('uses plural form for multiple comments', () => {
        expect(formatCommentCount(5)).toBe('5 comments');
        expect(formatCommentCount(123)).toBe('123 comments');
    });
});
