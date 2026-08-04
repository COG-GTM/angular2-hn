import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { MemoryRouter, useNavigate } from 'react-router-dom';

import { usePageviewTracking } from './use-analytics';

function wrapper({ children }: { children: ReactNode }) {
    return createElement(MemoryRouter, { initialEntries: ['/news/1'] }, children);
}

function useTrackedNavigate() {
    usePageviewTracking();
    return useNavigate();
}

afterEach(() => {
    delete window.ga;
});

describe('usePageviewTracking', () => {
    it('sends a pageview for the current location', async () => {
        const ga = jest.fn();
        window.ga = ga;

        renderHook(() => usePageviewTracking(), { wrapper });

        await waitFor(() => expect(ga).toHaveBeenCalledWith('set', 'page', '/news/1'));
        expect(ga).toHaveBeenCalledWith('send', 'pageview');
        expect(ga).toHaveBeenCalledTimes(2);
    });

    it('sends exactly one pageview per navigation', async () => {
        const ga = jest.fn();
        window.ga = ga;

        const { result } = renderHook(() => useTrackedNavigate(), { wrapper });

        await waitFor(() => expect(ga).toHaveBeenCalledTimes(2));

        act(() => result.current('/item/42?ref=feed'));

        await waitFor(() => expect(ga).toHaveBeenCalledTimes(4));
        expect(ga.mock.calls).toEqual([
            ['set', 'page', '/news/1'],
            ['send', 'pageview'],
            ['set', 'page', '/item/42?ref=feed'],
            ['send', 'pageview'],
        ]);
    });

    it('only reports the resolved location when one navigation immediately replaces another', async () => {
        const ga = jest.fn();
        window.ga = ga;

        const { result } = renderHook(() => useTrackedNavigate(), { wrapper });

        act(() => result.current('/news/1', { replace: true }));
        act(() => result.current('/jobs/1', { replace: true }));

        await waitFor(() => expect(ga).toHaveBeenCalledTimes(2));
        expect(ga.mock.calls).toEqual([
            ['set', 'page', '/jobs/1'],
            ['send', 'pageview'],
        ]);
    });

    it('does not throw when window.ga is undefined', async () => {
        const { result } = renderHook(() => useTrackedNavigate(), { wrapper });

        await act(async () => {
            result.current('/user/pg');
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(window.ga).toBeUndefined();
    });
});
