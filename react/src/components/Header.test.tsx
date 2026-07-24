// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';

import Header from './Header';
import { SettingsProvider } from '../context/SettingsContext';

function mockMatchMedia() {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
    }));
}

function renderHeader(children: ReactNode = <Header />, initialEntries = ['/news/1']) {
    return render(
        <MemoryRouter initialEntries={initialEntries}>
            <SettingsProvider>{children}</SettingsProvider>
        </MemoryRouter>,
    );
}

describe('Header', () => {
    beforeEach(() => {
        localStorage.clear();
        mockMatchMedia();
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('renders the logo linking to /news/1', () => {
        renderHeader();
        const logo = screen.getByAltText('Logo');
        expect(logo).toBeTruthy();
        expect(logo.closest('a')?.getAttribute('href')).toBe('/news/1');
    });

    it('renders nav links to newest, show, ask and jobs', () => {
        renderHeader();
        expect(screen.getByText('new').getAttribute('href')).toBe('/newest/1');
        expect(screen.getByText('show').getAttribute('href')).toBe('/show/1');
        expect(screen.getByText('ask').getAttribute('href')).toBe('/ask/1');
        expect(screen.getByText('jobs').getAttribute('href')).toBe('/jobs/1');
    });

    it('marks the current feed link as active', () => {
        renderHeader(<Header />, ['/newest/1']);
        expect(screen.getByText('new').className).toContain('active');
        expect(screen.getByText('show').className).not.toContain('active');
    });

    it('scrolls to top when a nav link is clicked', () => {
        const scrollTo = vi.fn();
        window.scrollTo = scrollTo;
        renderHeader();
        fireEvent.click(screen.getByText('new'));
        expect(scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('toggles the settings panel when the cog is clicked', () => {
        const { container } = renderHeader();
        expect(container.querySelector('.overlay')).toBeNull();
        fireEvent.click(screen.getByAltText('Settings'));
        expect(container.querySelector('.overlay')).not.toBeNull();
        fireEvent.click(screen.getByAltText('Settings'));
        expect(container.querySelector('.overlay')).toBeNull();
    });
});
