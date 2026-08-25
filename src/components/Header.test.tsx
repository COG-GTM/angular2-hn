import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SettingsProvider } from '../context/SettingsContext';
import Header from './Header';

function renderHeader(path = '/news/1') {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <SettingsProvider>
                <Header />
            </SettingsProvider>
        </MemoryRouter>
    );
}

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe('Header', () => {
    it('links to every feed and marks the active one', () => {
        renderHeader('/ask/1');

        expect(screen.getByText('new').getAttribute('href')).toBe('/newest/1');
        expect(screen.getByText('show').getAttribute('href')).toBe('/show/1');
        expect(screen.getByText('jobs').getAttribute('href')).toBe('/jobs/1');
        expect(screen.getByText('ask').className).toBe('active');
        expect(screen.getByText('new').className).toBe('');
    });

    it('scrolls to the top when a feed link is used', () => {
        const scrollTo = vi.fn();
        vi.stubGlobal('scrollTo', scrollTo);

        renderHeader();
        fireEvent.click(screen.getByText('show'));

        expect(scrollTo).toHaveBeenCalledWith(0, 0);
        vi.unstubAllGlobals();
    });

    it('renders the settings panel only once toggled', () => {
        renderHeader();

        expect(screen.queryByText('Settings', { selector: 'h1' })).toBeNull();

        fireEvent.click(screen.getByAltText('Settings'));

        expect(screen.getByText('Settings', { selector: 'h1' })).toBeTruthy();
    });
});
