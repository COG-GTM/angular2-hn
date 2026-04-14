import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SettingsProvider } from '../context/SettingsContext';
import Header from '../components/layout/Header';

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <SettingsProvider>
      <MemoryRouter>{ui}</MemoryRouter>
    </SettingsProvider>
  );
}

describe('Header', () => {
  it('renders navigation links', () => {
    renderWithProviders(<Header />);
    expect(screen.getByText('new')).toBeInTheDocument();
    expect(screen.getByText('show')).toBeInTheDocument();
    expect(screen.getByText('ask')).toBeInTheDocument();
    expect(screen.getByText('jobs')).toBeInTheDocument();
  });

  it('renders the logo', () => {
    renderWithProviders(<Header />);
    expect(screen.getByText('HN')).toBeInTheDocument();
  });

  it('renders the settings button', () => {
    renderWithProviders(<Header />);
    expect(screen.getByLabelText('Settings')).toBeInTheDocument();
  });
});
