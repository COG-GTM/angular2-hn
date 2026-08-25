import { describe, expect, it } from 'vitest';

import { formatCommentCount } from './formatCommentCount';

describe('formatCommentCount', () => {
    it('returns "discuss" when there are no comments', () => {
        expect(formatCommentCount(0)).toBe('discuss');
        expect(formatCommentCount(-1)).toBe('discuss');
    });

    it('singularizes a single comment', () => {
        expect(formatCommentCount(1)).toBe('1 comment');
    });

    it('pluralizes multiple comments', () => {
        expect(formatCommentCount(42)).toBe('42 comments');
    });
});
