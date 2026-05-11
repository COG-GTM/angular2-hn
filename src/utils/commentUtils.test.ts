import { describe, it, expect } from 'vitest';
import { formatCommentCount } from './commentUtils';

describe('formatCommentCount', () => {
  it('returns "discuss" for zero comments', () => {
    expect(formatCommentCount(0)).toBe('discuss');
  });

  it('returns "discuss" for negative counts', () => {
    expect(formatCommentCount(-5)).toBe('discuss');
  });

  it('uses singular form for exactly one comment', () => {
    expect(formatCommentCount(1)).toBe('1 comment');
  });

  it('uses plural form for more than one comment', () => {
    expect(formatCommentCount(2)).toBe('2 comments');
    expect(formatCommentCount(123)).toBe('123 comments');
  });
});
