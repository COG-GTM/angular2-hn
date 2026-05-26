import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, it, expect, beforeEach } from 'vitest';
import { Settings } from '../Settings';
import { SettingsProvider } from '@/contexts/SettingsContext';

function renderSettings() {
  return render(
    <SettingsProvider>
      <Settings />
    </SettingsProvider>
  );
}

describe('Settings', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the heading', () => {
    renderSettings();
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
  });

  it('renders the close button', () => {
    renderSettings();
    expect(screen.getByText('\u00d7')).toBeInTheDocument();
  });

  it('renders the "Open links in a new tab" checkbox', () => {
    renderSettings();
    const checkbox = screen.getByRole('checkbox', { name: /open links in a new tab/i });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it('toggles the "Open links in a new tab" checkbox', async () => {
    const user = userEvent.setup();
    renderSettings();

    const checkbox = screen.getByRole('checkbox', { name: /open links in a new tab/i });
    await user.click(checkbox);
    expect(checkbox).toBeChecked();

    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('renders theme radio buttons', () => {
    renderSettings();
    expect(screen.getByRole('radio', { name: 'Default' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Night' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Black (AMOLED)' })).toBeInTheDocument();
  });

  it('selects the default theme by default', () => {
    renderSettings();
    expect(screen.getByRole('radio', { name: 'Default' })).toBeChecked();
  });

  it('allows switching themes', async () => {
    const user = userEvent.setup();
    renderSettings();

    await user.click(screen.getByRole('radio', { name: 'Night' }));
    expect(screen.getByRole('radio', { name: 'Night' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Default' })).not.toBeChecked();
  });

  it('persists theme selection to localStorage', async () => {
    const user = userEvent.setup();
    renderSettings();

    await user.click(screen.getByRole('radio', { name: 'Night' }));
    expect(localStorage.getItem('theme')).toBe('night');
  });

  it('renders font size input', () => {
    renderSettings();
    const fontInput = screen.getByRole('spinbutton', { name: /font size/i });
    expect(fontInput).toBeInTheDocument();
    expect(fontInput).toHaveValue(16);
  });

  it('renders list spacing input', () => {
    renderSettings();
    const spacingInput = screen.getByRole('spinbutton', { name: /list spacing/i });
    expect(spacingInput).toBeInTheDocument();
    expect(spacingInput).toHaveValue(0);
  });

  it('passes accessibility checks', async () => {
    const { container } = renderSettings();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
