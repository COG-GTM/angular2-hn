import { describe, it, expect } from 'vitest';
import { formatCommentCount } from '../utils/commentUtils';

describe('formatCommentCount', () => {
  it('returns "discuss" for 0 comments', () => {
    expect(formatCommentCount(0)).toBe('discuss');
  });

  it('returns "1 comment" for 1 comment', () => {
    expect(formatCommentCount(1)).toBe('1 comment');
  });

  it('returns "5 comments" for 5 comments', () => {
    expect(formatCommentCount(5)).toBe('5 comments');
  });
});
