import { describe, expect, it } from 'vitest';

import { formatCommentCount } from './comment-count';

describe('formatCommentCount', () => {
    it('returns "discuss" for zero comments', () => {
        expect(formatCommentCount(0)).toBe('discuss');
    });

    it('returns singular for one comment', () => {
        expect(formatCommentCount(1)).toBe('1 comment');
    });

    it('returns plural for multiple comments', () => {
        expect(formatCommentCount(42)).toBe('42 comments');
    });
});
