import { describe, it, expect } from 'vitest';
import { formatCommentCount } from './formatCommentCount';

describe('formatCommentCount', () => {
    it('returns "discuss" for 0', () => {
        expect(formatCommentCount(0)).toBe('discuss');
    });

    it('returns "1 comment" for 1', () => {
        expect(formatCommentCount(1)).toBe('1 comment');
    });

    it('returns "N comments" for values greater than 1', () => {
        expect(formatCommentCount(2)).toBe('2 comments');
    });

    it('returns "discuss" for negative values', () => {
        expect(formatCommentCount(-5)).toBe('discuss');
    });
});
