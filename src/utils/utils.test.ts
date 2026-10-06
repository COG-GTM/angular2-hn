import { describe, expect, it } from 'vitest';
import { formatCommentCount, hasExternalUrl, linkTargetProps } from '.';

describe('formatCommentCount', () => {
    it('returns "discuss" for zero or missing counts', () => {
        expect(formatCommentCount(0)).toBe('discuss');
        expect(formatCommentCount(undefined)).toBe('discuss');
        expect(formatCommentCount(null)).toBe('discuss');
    });

    it('uses singular for one comment', () => {
        expect(formatCommentCount(1)).toBe('1 comment');
    });

    it('uses plural for multiple comments', () => {
        expect(formatCommentCount(42)).toBe('42 comments');
    });
});

describe('hasExternalUrl', () => {
    it('detects absolute http(s) urls', () => {
        expect(hasExternalUrl('https://example.com')).toBe(true);
        expect(hasExternalUrl('http://example.com')).toBe(true);
    });

    it('rejects relative HN item urls and empty values', () => {
        expect(hasExternalUrl('item?id=123')).toBe(false);
        expect(hasExternalUrl('')).toBe(false);
        expect(hasExternalUrl(undefined)).toBe(false);
    });
});

describe('linkTargetProps', () => {
    it('returns target/rel only when opening in a new tab', () => {
        expect(linkTargetProps(true)).toEqual({ target: '_blank', rel: 'noopener' });
        expect(linkTargetProps(false)).toEqual({});
    });
});
