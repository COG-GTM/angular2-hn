import { describe, it, expect } from 'vitest';
import { formatCommentCount } from './comment';

describe('formatCommentCount', () => {
    it('returns "discuss" when there are no comments', () => {
        expect(formatCommentCount(0)).toBe('discuss');
        expect(formatCommentCount(-5)).toBe('discuss');
    });

    it('uses the singular form for one comment', () => {
        expect(formatCommentCount(1)).toBe('1 comment');
    });

    it('uses the plural form for multiple comments', () => {
        expect(formatCommentCount(2)).toBe('2 comments');
        expect(formatCommentCount(42)).toBe('42 comments');
    });
});
