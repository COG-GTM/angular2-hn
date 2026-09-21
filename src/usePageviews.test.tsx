import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { usePageviews } from './usePageviews';

function Harness() {
    usePageviews();
    return null;
}

afterEach(() => {
    delete window.ga;
});

describe('usePageviews', () => {
    it('sends a pageview for the current location', () => {
        const ga = vi.fn();
        window.ga = ga;

        render(
            <MemoryRouter initialEntries={['/show/2?ref=hn']}>
                <Harness />
            </MemoryRouter>
        );

        expect(ga).toHaveBeenNthCalledWith(1, 'set', 'page', '/show/2?ref=hn');
        expect(ga).toHaveBeenNthCalledWith(2, 'send', 'pageview');
    });

    it('does nothing when analytics is unavailable', () => {
        expect(() =>
            render(
                <MemoryRouter initialEntries={['/news/1']}>
                    <Harness />
                </MemoryRouter>
            )
        ).not.toThrow();
    });
});
