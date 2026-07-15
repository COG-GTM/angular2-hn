import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';
import { SettingsProvider } from '../context/SettingsContext';

function renderHeader() {
    return render(
        <MemoryRouter>
            <SettingsProvider>
                <Header />
            </SettingsProvider>
        </MemoryRouter>
    );
}

describe('Header', () => {
    it('renders the nav links to the feed routes', () => {
        renderHeader();

        expect(screen.getByRole('link', { name: 'new' }).getAttribute('href')).toBe('/newest/1');
        expect(screen.getByRole('link', { name: 'show' }).getAttribute('href')).toBe('/show/1');
        expect(screen.getByRole('link', { name: 'ask' }).getAttribute('href')).toBe('/ask/1');
        expect(screen.getByRole('link', { name: 'jobs' }).getAttribute('href')).toBe('/jobs/1');
    });

    it('renders the home link with the logo', () => {
        renderHeader();

        const home = screen.getByRole('link', { name: 'Logo' });
        expect(home.getAttribute('href')).toBe('/news/1');
    });

    it('toggles the settings panel when the cog is clicked', () => {
        renderHeader();

        expect(screen.queryByRole('heading', { name: 'Settings' })).toBeNull();

        fireEvent.click(screen.getByAltText('Settings'));

        expect(screen.getByRole('heading', { name: 'Settings' })).toBeTruthy();
    });
});
