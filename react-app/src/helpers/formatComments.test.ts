import { formatComments } from './formatComments';

describe('formatComments', () => {
  it('returns "discuss" for 0', () => {
    expect(formatComments(0)).toBe('discuss');
  });

  it('returns "1 comment" for 1', () => {
    expect(formatComments(1)).toBe('1 comment');
  });

  it('returns "N comments" for more than 1', () => {
    expect(formatComments(5)).toBe('5 comments');
  });
});
