import { describe, expect, it } from 'vitest';
import { formatComment } from './formatComment';

describe('formatComment', () => {
  it('returns "discuss" when there are no comments', () => {
    expect(formatComment(0)).toBe('discuss');
  });

  it('uses the singular form for a single comment', () => {
    expect(formatComment(1)).toBe('1 comment');
  });

  it('uses the plural form for multiple comments', () => {
    expect(formatComment(5)).toBe('5 comments');
  });
});
