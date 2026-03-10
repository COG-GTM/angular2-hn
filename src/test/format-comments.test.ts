import { describe, it, expect } from 'vitest';
import { formatCommentCount } from '../utils/format-comments';

describe('formatCommentCount', () => {
    it('returns "discuss" when count is 0', () => {
        expect(formatCommentCount(0)).toBe('discuss');
    });

    it('returns "1 comment" when count is 1', () => {
        expect(formatCommentCount(1)).toBe('1 comment');
    });

    it('returns "5 comments" when count is 5', () => {
        expect(formatCommentCount(5)).toBe('5 comments');
    });
});
