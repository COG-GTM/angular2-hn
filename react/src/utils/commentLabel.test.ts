import { describe, expect, it } from 'vitest';
import { commentLabel } from './commentLabel';

describe('commentLabel', () => {
  it('matches the Angular comment pipe', () => {
    expect(commentLabel(0)).toBe('discuss');
    expect(commentLabel(1)).toBe('1 comment');
    expect(commentLabel(28)).toBe('28 comments');
  });
});
