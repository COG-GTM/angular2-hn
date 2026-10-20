import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { commentLabel, isSafeHref, sanitizeHtml, useScrollToTop } from './index';

describe('commentLabel', () => {
    it.each([
        [0, 'discuss'],
        [undefined, 'discuss'],
        [null, 'discuss'],
        [1, '1 comment'],
        [2, '2 comments'],
        [101, '101 comments'],
    ])('%j → %s', (count, label) => {
        expect(commentLabel(count as number)).toBe(label);
    });
});

describe('sanitizeHtml', () => {
    it('keeps HN formatting', () => {
        const html = '<p>Hello <i>there</i></p><pre><code>x = 1</code></pre>';
        expect(sanitizeHtml(html)).toBe(html);
    });

    it('returns an empty string for empty input', () => {
        expect(sanitizeHtml('')).toBe('');
        expect(sanitizeHtml(undefined)).toBe('');
    });

    it('drops scripts, styles and embeds with their content', () => {
        const out = sanitizeHtml('a<script>alert(1)</script><style>p{}</style><iframe src="x"></iframe>b');
        expect(out).toBe('ab');
    });

    it('strips event handlers and other attributes', () => {
        const out = sanitizeHtml('<p onclick="x()" style="color:red" class="c">t</p><img src=x onerror="alert(1)">');
        expect(out).toBe('<p>t</p>');
    });

    it('unwraps unknown elements but keeps their text', () => {
        expect(sanitizeHtml('<div><font>text</font></div>')).toBe('text');
    });

    it('removes javascript:, data: and obfuscated scheme hrefs', () => {
        for (const href of [
            'javascript:alert(1)',
            ' JaVaScRiPt:alert(1)',
            'java\nscript:alert(1)',
            'data:text/html,x',
        ]) {
            const doc = new DOMParser().parseFromString(sanitizeHtml(`<a href="${href}">x</a>`), 'text/html');
            expect(doc.querySelector('a')?.hasAttribute('href')).toBe(false);
        }
    });

    it('rejects protocol-relative hrefs starting with // or /\\', () => {
        expect(isSafeHref('//evil.com')).toBe(false);
        expect(isSafeHref('/\\evil.com')).toBe(false);
        expect(sanitizeHtml('<a href="//evil.com">x</a>')).not.toContain('href');
    });

    it('keeps http(s), mailto and relative links and forces rel', () => {
        const out = sanitizeHtml('<a href="https://example.com" rel="opener" target="_blank">x</a>');
        expect(out).toBe('<a href="https://example.com" rel="nofollow noopener noreferrer">x</a>');
        expect(isSafeHref('mailto:a@b.c')).toBe(true);
        expect(isSafeHref('/item/1')).toBe(true);
        expect(isSafeHref('item?id=1')).toBe(true);
    });

    it('removes comments', () => {
        expect(sanitizeHtml('a<!-- x -->b')).toBe('ab');
    });
});

describe('useScrollToTop', () => {
    function Probe({ dep }: { dep: string }) {
        useScrollToTop(dep);
        return null;
    }

    it('scrolls on mount and whenever the dependency changes', () => {
        const { rerender } = render(<Probe dep="a" />);
        expect(window.scrollTo).toHaveBeenCalledTimes(1);
        rerender(<Probe dep="a" />);
        expect(window.scrollTo).toHaveBeenCalledTimes(1);
        rerender(<Probe dep="b" />);
        expect(window.scrollTo).toHaveBeenCalledTimes(2);
        expect(window.scrollTo).toHaveBeenLastCalledWith(0, 0);
    });
});
