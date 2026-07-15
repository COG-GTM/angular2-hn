import { describe, expect, it } from 'vitest';
import { commentPipe } from '../../src/utils/commentPipe';

describe('commentPipe', () => {
  it('returns "discuss" for 0 comments', () => {
    expect(commentPipe(0)).toBe('discuss');
  });

  it('returns "discuss" for negative counts', () => {
    expect(commentPipe(-5)).toBe('discuss');
  });

  it('returns singular "1 comment" for one comment', () => {
    expect(commentPipe(1)).toBe('1 comment');
  });

  it('returns plural "N comments" for many comments', () => {
    expect(commentPipe(2)).toBe('2 comments');
    expect(commentPipe(42)).toBe('42 comments');
  });
});
