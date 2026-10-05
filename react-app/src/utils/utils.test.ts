import { externalLinkProps, formatCommentCount, hasExternalUrl } from '.';

describe('formatCommentCount', () => {
  it.each([
    [0, 'discuss'],
    [-1, 'discuss'],
    [1, '1 comment'],
    [2, '2 comments'],
    [130, '130 comments'],
  ])('%i -> %s', (count, expected) => {
    expect(formatCommentCount(count)).toBe(expected);
  });
});

describe('hasExternalUrl', () => {
  it('detects absolute links', () => {
    expect(hasExternalUrl('https://example.com')).toBe(true);
    expect(hasExternalUrl('http://example.com')).toBe(true);
    expect(hasExternalUrl('item?id=123')).toBe(false);
    expect(hasExternalUrl(undefined)).toBe(false);
  });
});

describe('externalLinkProps', () => {
  it('adds target/rel only when opening in a new tab', () => {
    expect(externalLinkProps(true)).toEqual({ target: '_blank', rel: 'noopener' });
    expect(externalLinkProps(false)).toEqual({});
  });
});
