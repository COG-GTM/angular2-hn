import { describe, expect, it } from 'vitest';
import { formatCommentCount } from './comment';

describe('formatCommentCount', () => {
    it('returns a singular label for one comment', () => {
        expect(formatCommentCount(1)).toBe('1 comment');
    });

    it('returns a plural label for several comments', () => {
        expect(formatCommentCount(42)).toBe('42 comments');
    });

    it('returns discuss when there are no comments', () => {
        expect(formatCommentCount(0)).toBe('discuss');
    });
});
