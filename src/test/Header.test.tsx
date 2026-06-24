import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SettingsProvider } from '../context/SettingsContext';
import Header from '../components/Header';

function renderWithProviders(ui: React.ReactElement) {
    return render(
        <SettingsProvider>
            <MemoryRouter>{ui}</MemoryRouter>
        </SettingsProvider>
    );
}

describe('Header', () => {
    it('renders nav links', () => {
        renderWithProviders(<Header />);
        expect(screen.getByText('new')).toBeInTheDocument();
        expect(screen.getByText('show')).toBeInTheDocument();
        expect(screen.getByText('ask')).toBeInTheDocument();
        expect(screen.getByText('jobs')).toBeInTheDocument();
    });

    it('renders the logo', () => {
        renderWithProviders(<Header />);
        expect(screen.getByAltText('Logo')).toBeInTheDocument();
    });

    it('renders the settings icon', () => {
        renderWithProviders(<Header />);
        expect(screen.getByAltText('Settings')).toBeInTheDocument();
    });

    it('toggles settings panel on cog click', () => {
        renderWithProviders(<Header />);
        expect(screen.queryByText('Select a theme')).not.toBeInTheDocument();
        fireEvent.click(screen.getByAltText('Settings'));
        expect(screen.getByText('Select a theme')).toBeInTheDocument();
    });
});
