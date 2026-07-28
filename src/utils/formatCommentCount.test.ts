import { describe, expect, it } from 'vitest';
import { formatCommentCount } from './formatCommentCount';

describe('formatCommentCount', () => {
  it('returns "discuss" for zero comments', () => {
    expect(formatCommentCount(0)).toBe('discuss');
  });

  it('returns "discuss" for negative/undefined-like counts', () => {
    expect(formatCommentCount(-1)).toBe('discuss');
  });

  it('returns singular form for one comment', () => {
    expect(formatCommentCount(1)).toBe('1 comment');
  });

  it('returns plural form for more than one comment', () => {
    expect(formatCommentCount(2)).toBe('2 comments');
    expect(formatCommentCount(42)).toBe('42 comments');
  });
});
