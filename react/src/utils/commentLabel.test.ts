import { describe, it, expect } from 'vitest';
import { commentLabel } from './commentLabel';

describe('commentLabel', () => {
    it('returns "discuss" when count is 0', () => {
        expect(commentLabel(0)).toBe('discuss');
    });

    it('returns "discuss" for negative counts', () => {
        expect(commentLabel(-1)).toBe('discuss');
    });

    it('returns singular form for 1', () => {
        expect(commentLabel(1)).toBe('1 comment');
    });

    it('returns plural form for counts greater than 1', () => {
        expect(commentLabel(2)).toBe('2 comments');
        expect(commentLabel(42)).toBe('42 comments');
    });
});
