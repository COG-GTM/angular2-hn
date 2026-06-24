import { describe, it, expect } from 'vitest';
import { commentLabel } from '../utils/commentLabel';

describe('commentLabel', () => {
    it('returns "discuss" for 0', () => {
        expect(commentLabel(0)).toBe('discuss');
    });

    it('returns "1 comment" for 1', () => {
        expect(commentLabel(1)).toBe('1 comment');
    });

    it('returns "N comments" for N > 1', () => {
        expect(commentLabel(5)).toBe('5 comments');
        expect(commentLabel(100)).toBe('100 comments');
    });

    it('returns "discuss" for negative numbers', () => {
        expect(commentLabel(-1)).toBe('discuss');
    });
});
