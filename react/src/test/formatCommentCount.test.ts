import { describe, expect, it } from 'vitest';
import { formatCommentCount } from '../utils/formatCommentCount';

describe('formatCommentCount', () => {
  it('formats singular and plural comments', () => {
    expect(formatCommentCount(1)).toBe('1 comment');
    expect(formatCommentCount(2)).toBe('2 comments');
  });

  it('uses discuss for zero comments', () => {
    expect(formatCommentCount(0)).toBe('discuss');
  });
});
