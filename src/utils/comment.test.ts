import { describe, expect, it } from 'vitest';

import { commentText } from './comment';

describe('commentText', () => {
  it('returns "discuss" when there are no comments', () => {
    expect(commentText(0)).toBe('discuss');
  });

  it('uses singular for one comment', () => {
    expect(commentText(1)).toBe('1 comment');
  });

  it('uses plural for multiple comments', () => {
    expect(commentText(5)).toBe('5 comments');
  });
});
