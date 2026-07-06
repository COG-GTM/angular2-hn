import { describe, expect, it } from 'vitest';
import { formatCommentCount } from './formatCommentCount';

describe('formatCommentCount', () => {
  it('returns "discuss" for 0', () => {
    expect(formatCommentCount(0)).toBe('discuss');
  });

  it('returns "discuss" for negative counts', () => {
    expect(formatCommentCount(-5)).toBe('discuss');
  });

  it('returns singular "comment" for 1', () => {
    expect(formatCommentCount(1)).toBe('1 comment');
  });

  it('returns plural "comments" for more than 1', () => {
    expect(formatCommentCount(2)).toBe('2 comments');
    expect(formatCommentCount(42)).toBe('42 comments');
  });
});
