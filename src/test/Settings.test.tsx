import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SettingsProvider } from '../context/SettingsContext';
import Settings from '../components/layout/Settings';
import Header from '../components/layout/Header';

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <SettingsProvider>
      <MemoryRouter>{ui}</MemoryRouter>
    </SettingsProvider>
  );
}

describe('Settings', () => {
  it('does not render when settings are closed', () => {
    renderWithProviders(<Settings />);
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
  });

  it('opens settings when toggled via header', () => {
    renderWithProviders(
      <>
        <Header />
        <Settings />
      </>
    );
    fireEvent.click(screen.getByLabelText('Settings'));
    expect(screen.getByText('Theme')).toBeInTheDocument();
    expect(screen.getByText('Default')).toBeInTheDocument();
    expect(screen.getByText('Night')).toBeInTheDocument();
    expect(screen.getByText('AMOLED Black')).toBeInTheDocument();
  });
});
