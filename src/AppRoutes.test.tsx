import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as api from './api/hackernews';
import { AppRoutes } from './AppRoutes';
import { SettingsProvider } from './context';

function renderAt(path: string) {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <SettingsProvider>
                <AppRoutes />
            </SettingsProvider>
        </MemoryRouter>
    );
}

beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('scrollTo', vi.fn());
    vi.spyOn(api, 'fetchFeed').mockResolvedValue([]);
    vi.spyOn(api, 'fetchItemContent').mockReturnValue(new Promise(() => {}));
});

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

describe('AppRoutes', () => {
    it.each(['news', 'newest', 'show', 'ask', 'jobs'])('renders the %s feed with its feed type', (feedType) => {
        const { container } = renderAt(`/${feedType}/2`);

        expect(container.querySelector('.main-content')).toBeInTheDocument();
        expect(api.fetchFeed).toHaveBeenCalledWith(feedType, 2, expect.any(AbortSignal));
    });

    it('renders item details', () => {
        const { container } = renderAt('/item/123');

        expect(container.querySelector('.main-content')).toBeInTheDocument();
        expect(api.fetchItemContent).toHaveBeenCalledWith(123, expect.any(AbortSignal));
    });

    it('renders a user profile', () => {
        const { container } = renderAt('/user/pg');

        expect(container.querySelector('.user-profile')).toBeInTheDocument();
    });

    it('redirects the root path to the first news page', () => {
        renderAt('/');

        expect(api.fetchFeed).toHaveBeenCalledWith('news', 1, expect.any(AbortSignal));
    });
});
