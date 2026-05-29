import { describe, it, expect } from 'vitest';
import { commentFormat } from './commentFormat';

describe('commentFormat', () => {
  it('returns "discuss" for 0 comments', () => {
    expect(commentFormat(0)).toBe('discuss');
  });

  it('returns "1 comment" for 1 comment', () => {
    expect(commentFormat(1)).toBe('1 comment');
  });

  it('returns "N comments" for multiple comments', () => {
    expect(commentFormat(5)).toBe('5 comments');
    expect(commentFormat(100)).toBe('100 comments');
  });
});
