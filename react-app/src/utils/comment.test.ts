import { describe, it, expect } from 'vitest';
import { commentLabel } from './comment';

describe('commentLabel', () => {
    it('returns "discuss" when there are no comments', () => {
        expect(commentLabel(0)).toBe('discuss');
    });

    it('uses the singular form for a single comment', () => {
        expect(commentLabel(1)).toBe('1 comment');
    });

    it('uses the plural form for multiple comments', () => {
        expect(commentLabel(42)).toBe('42 comments');
    });
});
