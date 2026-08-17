import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsProvider } from '../context/SettingsProvider';
import { useSettings } from '../context/settingsContext';
import { Header } from './Header';
import { Footer } from './Footer';
import { Settings } from './Settings';

function ThemeWrapper({ children }: { children: React.ReactNode }) {
    const { settings } = useSettings();
    return (
        <div className={settings.theme} data-testid="theme-root">
            {children}
        </div>
    );
}

function renderWithProviders(ui: React.ReactNode, route = '/news/1') {
    return render(
        <MemoryRouter initialEntries={[route]}>
            <SettingsProvider>
                <ThemeWrapper>{ui}</ThemeWrapper>
            </SettingsProvider>
        </MemoryRouter>
    );
}

beforeEach(() => {
    localStorage.clear();
});

describe('Header', () => {
    it('renders the logo link and the feed nav links', () => {
        renderWithProviders(<Header />);

        const logo = screen.getByAltText('Logo');
        expect(logo).toHaveAttribute('src', '/assets/images/logo.svg');
        expect(logo.closest('a')).toHaveAttribute('href', '/news/1');

        expect(screen.getByRole('link', { name: 'new' })).toHaveAttribute('href', '/newest/1');
        expect(screen.getByRole('link', { name: 'show' })).toHaveAttribute('href', '/show/1');
        expect(screen.getByRole('link', { name: 'ask' })).toHaveAttribute('href', '/ask/1');
        expect(screen.getByRole('link', { name: 'jobs' })).toHaveAttribute('href', '/jobs/1');
    });

    it('marks the current feed link as active', () => {
        renderWithProviders(<Header />, '/show/1');
        expect(screen.getByRole('link', { name: 'show' })).toHaveClass('active');
        expect(screen.getByRole('link', { name: 'ask' })).not.toHaveClass('active');
    });

    it('scrolls to the top when a nav link is clicked', async () => {
        const scrollTo = vi.fn();
        vi.stubGlobal('scrollTo', scrollTo);
        renderWithProviders(<Header />);

        await userEvent.click(screen.getByRole('link', { name: 'ask' }));
        expect(scrollTo).toHaveBeenCalledWith(0, 0);
        vi.unstubAllGlobals();
    });

    it('toggles the settings panel with the cog', async () => {
        renderWithProviders(<Header />);
        expect(screen.queryByRole('heading', { name: 'Settings' })).not.toBeInTheDocument();

        await userEvent.click(screen.getByAltText('Settings'));
        expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();

        await userEvent.click(screen.getByAltText('Settings'));
        expect(screen.queryByRole('heading', { name: 'Settings' })).not.toBeInTheDocument();
    });
});

describe('Settings', () => {
    it('switches the theme and persists it', async () => {
        renderWithProviders(<Settings />);

        await userEvent.click(screen.getByLabelText('Night'));

        expect(screen.getByTestId('theme-root')).toHaveClass('night');
        expect(localStorage.getItem('theme')).toBe('night');

        await userEvent.click(screen.getByLabelText('Black (AMOLED)'));
        expect(screen.getByTestId('theme-root')).toHaveClass('amoledblack');
        expect(localStorage.getItem('theme')).toBe('amoledblack');
    });

    it('toggles opening links in a new tab', async () => {
        renderWithProviders(<Settings />);
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).not.toBeChecked();

        await userEvent.click(checkbox);

        expect(checkbox).toBeChecked();
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    });

    it('updates the title font size and list spacing', async () => {
        renderWithProviders(<Settings />);

        const fontSize = screen.getByLabelText(/Font size:/);
        await userEvent.clear(fontSize);
        await userEvent.type(fontSize, '22');
        expect(localStorage.getItem('titleFontSize')).toBe('22');

        const spacing = screen.getByLabelText(/List spacing:/);
        await userEvent.clear(spacing);
        await userEvent.type(spacing, '5');
        expect(localStorage.getItem('listSpacing')).toBe('5');
    });

    it('closes the panel with the close button', async () => {
        renderWithProviders(<Header />);
        await userEvent.click(screen.getByAltText('Settings'));

        await userEvent.click(screen.getByText('×'));

        expect(screen.queryByRole('heading', { name: 'Settings' })).not.toBeInTheDocument();
    });
});

describe('Footer', () => {
    it('renders the GitHub link', () => {
        render(<Footer />);
        expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
            'href',
            'https://github.com/hdjirdeh/angular2-hn'
        );
    });
});
