import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SettingsProvider } from '../contexts/SettingsContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

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

  it('renders settings cog', () => {
    renderWithProviders(<Header />);
    expect(screen.getByAltText('Settings')).toBeInTheDocument();
  });
});

describe('Footer', () => {
  it('renders GitHub link', () => {
    renderWithProviders(<Footer />);
    expect(screen.getByText('GitHub')).toBeInTheDocument();
  });
});

describe('Loader', () => {
  it('renders loading text', () => {
    render(<Loader />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});

describe('ErrorMessage', () => {
  it('renders error message', () => {
    render(<ErrorMessage message="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});
