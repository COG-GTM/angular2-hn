import { describe, expect, it } from 'vitest';

import { commentCount } from './commentCount';

describe('commentCount', () => {
    it('returns "discuss" for zero or negative counts', () => {
        expect(commentCount(0)).toBe('discuss');
        expect(commentCount(-1)).toBe('discuss');
    });

    it('uses the singular noun for exactly one comment', () => {
        expect(commentCount(1)).toBe('1 comment');
    });

    it('uses the plural noun for multiple comments', () => {
        expect(commentCount(2)).toBe('2 comments');
        expect(commentCount(42)).toBe('42 comments');
    });
});
