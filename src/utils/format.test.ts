import { describe, expect, it } from 'vitest';

import { commentLabel } from './format';

describe('commentLabel', () => {
  it('returns "discuss" when there are no comments', () => {
    expect(commentLabel(0)).toBe('discuss');
  });

  it('uses the singular form for a single comment', () => {
    expect(commentLabel(1)).toBe('1 comment');
  });

  it('uses the plural form for several comments', () => {
    expect(commentLabel(12)).toBe('12 comments');
  });
});
