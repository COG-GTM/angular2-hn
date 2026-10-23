import { fireEvent, render } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { usePageViews } from './analytics';
import { externalHref } from './externalHref';
import { formatCommentCount } from './formatCommentCount';
import { sanitizeHtml } from './sanitizeHtml';

describe('formatCommentCount', () => {
    it('matches the Angular comment pipe', () => {
        expect(formatCommentCount(0)).toBe('discuss');
        expect(formatCommentCount(1)).toBe('1 comment');
        expect(formatCommentCount(42)).toBe('42 comments');
    });
});

describe('externalHref', () => {
    it('keeps absolute http(s) urls as-is and rejects others', () => {
        expect(externalHref('https://example.com')).toBe('https://example.com');
        expect(externalHref('item?id=1')).toBeNull();
        expect(externalHref('javascript:alert(1)')).toBeNull();
        expect(externalHref('https:example.com')).toBeNull();
    });
});

describe('sanitizeHtml', () => {
    it('drops scripts and unsafe links, makes HN-relative links absolute', () => {
        const html = sanitizeHtml(
            '<p onclick="x">a<script>bad()</script><a href="javascript:x">j</a><a href="item?id=1">i</a></p>'
        );
        expect(html).not.toContain('script');
        expect(html).not.toContain('onclick');
        expect(html).not.toContain('javascript:');
        expect(html).toContain('href="https://news.ycombinator.com/item?id=1"');
    });
});

describe('usePageViews', () => {
    function Tracker({ to }: { to?: string }) {
        usePageViews();
        const navigate = useNavigate();
        return <button onClick={() => to && navigate(to)}>go</button>;
    }

    it('no-ops without window.ga', () => {
        expect(() =>
            render(
                <MemoryRouter>
                    <Tracker />
                </MemoryRouter>
            )
        ).not.toThrow();
    });

    it('sends a pageview per navigation', () => {
        const ga = vi.fn();
        vi.stubGlobal('ga', ga);
        const { getByRole } = render(
            <MemoryRouter initialEntries={['/news/1']}>
                <Tracker to="/item/5?x=1" />
            </MemoryRouter>
        );
        fireEvent.click(getByRole('button'));
        expect(ga.mock.calls).toEqual([
            ['set', 'page', '/news/1'],
            ['send', 'pageview'],
            ['set', 'page', '/item/5?x=1'],
            ['send', 'pageview'],
        ]);
    });
});
