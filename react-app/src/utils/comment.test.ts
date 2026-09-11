import { describe, expect, it } from 'vitest';
import { formatCommentCount } from './comment';

describe('formatCommentCount', () => {
    it('formats comment counts', () => {
        expect(formatCommentCount(0)).toBe('discuss');
        expect(formatCommentCount(1)).toBe('1 comment');
        expect(formatCommentCount(5)).toBe('5 comments');
    });
});
