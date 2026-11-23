import { commentLabel } from './commentLabel';
import { hasUrl } from './hasUrl';

describe('commentLabel', () => {
  it.each([
    [0, 'discuss'],
    [-1, 'discuss'],
    [1, '1 comment'],
    [2, '2 comments'],
    [1888, '1888 comments'],
  ])('%i -> %s', (count, label) => expect(commentLabel(count)).toBe(label));
});

describe('hasUrl', () => {
  it('is true only for absolute http(s) URLs', () => {
    expect(hasUrl('https://example.com')).toBe(true);
    expect(hasUrl('http://example.com')).toBe(true);
    expect(hasUrl('item?id=1')).toBe(false);
    expect(hasUrl(undefined)).toBe(false);
  });
});
