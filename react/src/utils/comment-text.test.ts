import { describe, expect, it } from 'vitest';
import { commentText } from './comment-text';

describe('commentText', () => {
  it('returns "discuss" for zero comments', () => {
    expect(commentText(0)).toBe('discuss');
  });

  it('returns singular for one comment', () => {
    expect(commentText(1)).toBe('1 comment');
  });

  it('returns plural for multiple comments', () => {
    expect(commentText(5)).toBe('5 comments');
  });
});
