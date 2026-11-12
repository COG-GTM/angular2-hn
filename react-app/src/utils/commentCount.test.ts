import { expect, it } from 'vitest';
import { formatCommentCount } from './commentCount';

it('matches the Angular comment pipe', () => {
    expect(formatCommentCount(0)).toBe('discuss');
    expect(formatCommentCount(1)).toBe('1 comment');
    expect(formatCommentCount(42)).toBe('42 comments');
});
