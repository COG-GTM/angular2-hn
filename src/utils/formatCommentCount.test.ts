import { describe, expect, it } from 'vitest';

import { formatCommentCount } from './formatCommentCount';

describe('formatCommentCount', () => {
    it('returns "discuss" when there are no comments', () => {
        expect(formatCommentCount(0)).toBe('discuss');
    });

    it('returns "discuss" for negative counts', () => {
        expect(formatCommentCount(-3)).toBe('discuss');
    });

    it('uses the singular form for a single comment', () => {
        expect(formatCommentCount(1)).toBe('1 comment');
    });

    it('uses the plural form for several comments', () => {
        expect(formatCommentCount(42)).toBe('42 comments');
    });
});
