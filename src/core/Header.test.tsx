import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SettingsProvider } from '../context/SettingsContext';
import { stubMatchMedia } from '../testUtils/matchMedia';
import { Header } from './Header';

const scrollTo = vi.fn();

beforeEach(() => {
    scrollTo.mockClear();
    vi.stubGlobal('scrollTo', scrollTo);
});

function renderHeader(initialEntry = '/news/1') {
    stubMatchMedia(false);

    return render(
        <SettingsProvider>
            <MemoryRouter initialEntries={[initialEntry]}>
                <Header />
            </MemoryRouter>
        </SettingsProvider>
    );
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('Header', () => {
    it('links the logo to the first news page and the nav to the other feeds', () => {
        const { container } = renderHeader();

        expect(screen.getByRole('img', { name: 'Logo' }).closest('a')).toHaveAttribute('href', '/news/1');
        expect(screen.getByRole('link', { name: 'new' })).toHaveAttribute('href', '/newest/1');
        expect(screen.getByRole('link', { name: 'show' })).toHaveAttribute('href', '/show/1');
        expect(screen.getByRole('link', { name: 'ask' })).toHaveAttribute('href', '/ask/1');
        expect(screen.getByRole('link', { name: 'jobs' })).toHaveAttribute('href', '/jobs/1');
        expect(container.querySelector('.header-nav')?.textContent).toBe('new | show | ask | jobs');
    });

    it('marks the link of the current feed as active', () => {
        renderHeader('/ask/1');

        expect(screen.getByRole('link', { name: 'ask' })).toHaveClass('active');
        expect(screen.getByRole('link', { name: 'show' })).not.toHaveClass('active');
        expect(screen.getByRole('img', { name: 'Logo' }).closest('a')).not.toHaveClass('active');
    });

    it('scrolls back to the top when a link is clicked', async () => {
        renderHeader();
        await userEvent.click(screen.getByRole('link', { name: 'new' }));

        expect(scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('opens and closes the settings modal from the cog', async () => {
        renderHeader();

        expect(document.getElementById('popup1')).toBeNull();

        await userEvent.click(screen.getByRole('img', { name: 'Settings' }));
        expect(document.getElementById('popup1')).not.toBeNull();

        await userEvent.click(screen.getByRole('img', { name: 'Settings' }));
        expect(document.getElementById('popup1')).toBeNull();
    });

    it('closes the settings modal from its close button', async () => {
        const { container } = renderHeader();

        await userEvent.click(screen.getByRole('img', { name: 'Settings' }));
        await userEvent.click(container.querySelector('.close')!);

        expect(document.getElementById('popup1')).toBeNull();
    });
});
