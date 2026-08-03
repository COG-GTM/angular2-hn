import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { createElement, type ReactNode } from 'react';

import { usePageViews } from './usePageViews';

function wrapperFor(route: string) {
    return function Wrapper({ children }: { children: ReactNode }) {
        return createElement(MemoryRouter, { initialEntries: [route] }, children);
    };
}

afterEach(() => {
    delete window.ga;
});

describe('usePageViews', () => {
    it('reports the current url to Google Analytics', () => {
        const ga = vi.fn();
        window.ga = ga;

        renderHook(() => usePageViews(), { wrapper: wrapperFor('/item/100?ref=hn') });

        expect(ga).toHaveBeenNthCalledWith(1, 'set', 'page', '/item/100?ref=hn');
        expect(ga).toHaveBeenNthCalledWith(2, 'send', 'pageview');
    });

    it('does nothing when the analytics snippet is blocked', () => {
        expect(() => renderHook(() => usePageViews(), { wrapper: wrapperFor('/news/1') })).not.toThrow();
    });
});
