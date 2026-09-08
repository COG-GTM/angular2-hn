import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SettingsProvider } from '../../context/SettingsContext';
import Header from './Header';

function renderHeader(initialEntry = '/news/1') {
    return render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <SettingsProvider>
                <Header />
            </SettingsProvider>
        </MemoryRouter>
    );
}

describe('Header', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.stubGlobal(
            'matchMedia',
            vi.fn(() => ({
                matches: false,
                media: '(prefers-color-scheme: dark)',
                onchange: null,
                addEventListener: () => {},
                removeEventListener: () => {},
                addListener: () => {},
                removeListener: () => {},
                dispatchEvent: () => true,
            }))
        );
    });

    it('marks the current feed link as active', () => {
        renderHeader('/show/1');

        expect(screen.getByRole('link', { name: 'show' })).toHaveClass('active');
        expect(screen.getByRole('link', { name: 'ask' })).not.toHaveClass('active');
    });

    it('toggles the settings modal from the cog', () => {
        renderHeader();

        expect(screen.queryByText('Settings', { selector: 'h1' })).not.toBeInTheDocument();

        fireEvent.click(screen.getByAltText('Settings'));

        expect(screen.getByText('Settings', { selector: 'h1' })).toBeInTheDocument();
    });
});
