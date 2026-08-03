import { describe, expect, it } from 'vitest';

import { commentLabel } from './commentLabel';

describe('commentLabel', () => {
  it('labels a single comment in the singular', () => {
    expect(commentLabel(1)).toBe('1 comment');
  });

  it('labels multiple comments in the plural', () => {
    expect(commentLabel(7)).toBe('7 comments');
  });

  it('invites discussion when there are no comments', () => {
    expect(commentLabel(0)).toBe('discuss');
  });
});
