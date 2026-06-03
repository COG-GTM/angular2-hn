import { beforeAll, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { Header } from './Header';
import { SettingsProvider } from '../context/SettingsContext';

beforeAll(() => {
    vi.stubGlobal(
        'matchMedia',
        vi.fn().mockImplementation((query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            addListener: vi.fn(),
            removeListener: vi.fn(),
            dispatchEvent: vi.fn(),
        }))
    );
});

function renderHeader() {
    return render(
        <SettingsProvider>
            <MemoryRouter>
                <Header />
            </MemoryRouter>
        </SettingsProvider>
    );
}

describe('Header', () => {
    it('renders the navigation links', () => {
        renderHeader();

        expect(screen.getByRole('link', { name: 'new' })).toHaveAttribute('href', '/newest/1');
        expect(screen.getByRole('link', { name: 'show' })).toHaveAttribute('href', '/show/1');
        expect(screen.getByRole('link', { name: 'ask' })).toHaveAttribute('href', '/ask/1');
        expect(screen.getByRole('link', { name: 'jobs' })).toHaveAttribute('href', '/jobs/1');
    });

    it('toggles the settings panel when the cog is clicked', async () => {
        const user = userEvent.setup();
        renderHeader();

        expect(screen.queryByRole('heading', { name: 'Settings' })).not.toBeInTheDocument();

        await user.click(screen.getByAltText('Settings'));

        expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    });
});
