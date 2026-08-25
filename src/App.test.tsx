import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Shell } from './App';
import { SettingsProvider } from './context/SettingsContext';

function renderShell(path: string) {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <SettingsProvider>
                <Shell />
            </SettingsProvider>
        </MemoryRouter>
    );
}

beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal(
        'fetch',
        vi.fn(async () => ({ ok: true, status: 200, json: async () => [] }) as unknown as Response)
    );
});

afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
});

describe('App shell', () => {
    it('redirects the root path to the first news page', async () => {
        renderShell('/');

        await waitFor(() => expect(fetch).toHaveBeenCalled());
        expect((fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBe(
            'https://node-hnapi.herokuapp.com/news?page=1'
        );
    });

    it('renders the chrome around the routed content', () => {
        const { container } = renderShell('/news/1');

        expect(container.querySelector('.wrapper')).toBeTruthy();
        expect(screen.getByText('new')).toBeTruthy();
        expect(screen.getByText('GitHub')).toBeTruthy();
    });

    it('sends unknown feed types back to the news feed', async () => {
        renderShell('/nonsense/1');

        await waitFor(() => expect(fetch).toHaveBeenCalled());
        expect((fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0]).toContain('/news?page=1');
    });

    it('applies the persisted theme as the outer wrapper class', () => {
        localStorage.setItem('theme', 'amoledblack');
        const { container } = renderShell('/news/1');

        expect(container.firstElementChild?.className).toBe('amoledblack');
    });

    it('routes item and user paths to their pages', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ id: 'ashwin', created: '', karma: 1 }) }) as unknown as Response)
        );
        renderShell('/user/ashwin');

        await waitFor(() => expect(screen.getByText('ashwin')).toBeTruthy());
    });
});
