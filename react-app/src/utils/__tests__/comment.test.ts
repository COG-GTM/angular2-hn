import { describe, expect, it } from 'vitest';

import { commentLabel } from '../comment';
import { hasExternalUrl } from '../url';

describe('commentLabel', () => {
    it('renders "discuss" when there are no comments', () => {
        expect(commentLabel(0)).toBe('discuss');
    });

    it('renders the singular form for a single comment', () => {
        expect(commentLabel(1)).toBe('1 comment');
    });

    it('renders the plural form for several comments', () => {
        expect(commentLabel(42)).toBe('42 comments');
    });
});

describe('hasExternalUrl', () => {
    it('detects absolute urls', () => {
        expect(hasExternalUrl('https://example.com')).toBe(true);
    });

    it('rejects relative hn urls', () => {
        expect(hasExternalUrl('item?id=1')).toBe(false);
        expect(hasExternalUrl(undefined)).toBe(false);
    });
});
