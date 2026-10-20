import { screen } from '@testing-library/react';
import { useLocation, useParams } from 'react-router';
import { describe, expect, it } from 'vitest';

import { useSettings } from '../settings';
import { deferred, jsonResponse, mockFetch, renderWithProviders, textResponse } from './index';

describe('mockFetch', () => {
    it('answers by exact URL, records calls, 404s unknown URLs', async () => {
        const handle = mockFetch({ 'https://a.test/1': { ok: 1 }, 'https://a.test/2': textResponse('hi', 500) });
        await expect((await fetch('https://a.test/1')).json()).resolves.toEqual({ ok: 1 });
        const r2 = await fetch('https://a.test/2');
        expect([r2.status, await r2.text()]).toEqual([500, 'hi']);
        const r3 = await fetch('https://a.test/3');
        expect(r3.status).toBe(404);
        expect(handle.unmatched).toEqual(['https://a.test/3']);
        expect(handle.calls.map((c) => c.url)).toHaveLength(3);
        expect(handle.callsTo('https://a.test/1')).toHaveLength(1);
    });

    it('awaits promise responders so a request can be held open', async () => {
        const d = deferred<Response>();
        const handle = mockFetch({ 'https://a.test/slow': () => d.promise });
        let done = false;
        const p = fetch('https://a.test/slow').then((r) => {
            done = true;
            return r.json();
        });
        await new Promise((r) => setTimeout(r, 5));
        expect(done).toBe(false);
        d.resolve(jsonResponse({ late: true }));
        await expect(p).resolves.toEqual({ late: true });
        handle.set('https://a.test/slow', { now: true });
        await expect((await fetch('https://a.test/slow')).json()).resolves.toEqual({ now: true });
    });

    it('rejects with AbortError when the signal aborts a held request', async () => {
        mockFetch({ 'https://a.test/held': () => new Promise(() => {}) });
        const controller = new AbortController();
        const p = fetch('https://a.test/held', { signal: controller.signal });
        controller.abort();
        await expect(p).rejects.toMatchObject({ name: 'AbortError' });
    });
});

describe('renderWithProviders', () => {
    function Probe() {
        const { id } = useParams();
        const { settings } = useSettings();
        return (
            <p>
                {useLocation().pathname} {id} {settings.theme}
            </p>
        );
    }

    it('provides router (route + path), settings and a query client', () => {
        const { queryClient } = renderWithProviders(<Probe />, { route: '/item/7', path: '/item/:id' });
        expect(screen.getByText('/item/7 7 default')).toBeInTheDocument();
        expect(queryClient.getDefaultOptions().queries?.retry).toBe(false);
    });
});
