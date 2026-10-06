import { describe, expect, it } from 'vitest';
import { commentLabel, externalLinkProps, hasExternalUrl, listStart } from './format';

describe('format utils', () => {
  it('commentLabel mirrors the comment pipe', () => {
    expect(commentLabel(0)).toBe('discuss');
    expect(commentLabel(1)).toBe('1 comment');
    expect(commentLabel(42)).toBe('42 comments');
    expect(commentLabel(undefined)).toBe('discuss');
  });

  it('hasExternalUrl detects absolute links', () => {
    expect(hasExternalUrl('https://example.com')).toBe(true);
    expect(hasExternalUrl('item?id=1')).toBe(false);
    expect(hasExternalUrl(undefined)).toBe(false);
  });

  it('listStart computes the rank of the first item on a page', () => {
    expect(listStart(1)).toBe(1);
    expect(listStart(3)).toBe(61);
  });

  it('externalLinkProps honours the open-in-new-tab setting', () => {
    expect(externalLinkProps(true)).toEqual({ target: '_blank', rel: 'noopener' });
    expect(externalLinkProps(false)).toEqual({});
  });
});
