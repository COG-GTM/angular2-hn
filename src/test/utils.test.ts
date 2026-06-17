import { describe, it, expect } from 'vitest';
import { commentPipe } from '../utils/commentPipe';

describe('commentPipe', () => {
  it('returns "discuss" for 0 comments', () => {
    expect(commentPipe(0)).toBe('discuss');
  });

  it('returns "1 comment" for 1 comment', () => {
    expect(commentPipe(1)).toBe('1 comment');
  });

  it('returns "N comments" for multiple comments', () => {
    expect(commentPipe(5)).toBe('5 comments');
    expect(commentPipe(100)).toBe('100 comments');
  });
});
