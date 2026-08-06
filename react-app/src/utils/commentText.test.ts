import { describe, expect, it } from 'vitest';

import { commentText } from './commentText';

describe('commentText', () => {
  it('returns "discuss" for zero comments', () => {
    expect(commentText(0)).toBe('discuss');
  });

  it('returns singular for one comment', () => {
    expect(commentText(1)).toBe('1 comment');
  });

  it('returns plural for many comments', () => {
    expect(commentText(42)).toBe('42 comments');
  });
});
