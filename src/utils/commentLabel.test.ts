import { describe, expect, it } from 'vitest';
import { commentLabel } from './commentLabel';

describe('commentLabel', () => {
    it('returns "discuss" when there are no comments', () => {
        expect(commentLabel(0)).toBe('discuss');
    });

    it('returns "discuss" for negative counts', () => {
        expect(commentLabel(-3)).toBe('discuss');
    });

    it('uses the singular form for a single comment', () => {
        expect(commentLabel(1)).toBe('1 comment');
    });

    it('uses the plural form for multiple comments', () => {
        expect(commentLabel(7)).toBe('7 comments');
    });
});
