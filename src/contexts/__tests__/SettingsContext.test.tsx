import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SettingsProvider, useSettings } from '../SettingsContext';

function TestConsumer() {
  const { settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFontSize, setSpacing } =
    useSettings();

  return (
    <div>
      <span data-testid="showSettings">{String(settings.showSettings)}</span>
      <span data-testid="theme">{settings.theme}</span>
      <span data-testid="openLinkInNewTab">{String(settings.openLinkInNewTab)}</span>
      <span data-testid="fontSize">{settings.titleFontSize}</span>
      <span data-testid="spacing">{settings.listSpacing}</span>
      <button onClick={toggleSettings}>Toggle Settings</button>
      <button onClick={toggleOpenLinksInNewTab}>Toggle Links</button>
      <button onClick={() => setTheme('night')}>Night Theme</button>
      <button onClick={() => setFontSize('20')}>Font 20</button>
      <button onClick={() => setSpacing('5')}>Spacing 5</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <SettingsProvider>
      <TestConsumer />
    </SettingsProvider>
  );
}

describe('SettingsContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides default settings values', () => {
    renderWithProvider();
    expect(screen.getByTestId('showSettings')).toHaveTextContent('false');
    expect(screen.getByTestId('theme')).toHaveTextContent('default');
    expect(screen.getByTestId('openLinkInNewTab')).toHaveTextContent('false');
    expect(screen.getByTestId('fontSize')).toHaveTextContent('16');
    expect(screen.getByTestId('spacing')).toHaveTextContent('0');
  });

  it('toggles showSettings', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByText('Toggle Settings'));
    expect(screen.getByTestId('showSettings')).toHaveTextContent('true');

    await user.click(screen.getByText('Toggle Settings'));
    expect(screen.getByTestId('showSettings')).toHaveTextContent('false');
  });

  it('toggles openLinkInNewTab and persists to localStorage', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByText('Toggle Links'));
    expect(screen.getByTestId('openLinkInNewTab')).toHaveTextContent('true');
    expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
  });

  it('sets theme and persists to localStorage', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByText('Night Theme'));
    expect(screen.getByTestId('theme')).toHaveTextContent('night');
    expect(localStorage.getItem('theme')).toBe('night');
  });

  it('sets font size and persists to localStorage', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByText('Font 20'));
    expect(screen.getByTestId('fontSize')).toHaveTextContent('20');
    expect(localStorage.getItem('titleFontSize')).toBe('20');
  });

  it('sets spacing and persists to localStorage', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByText('Spacing 5'));
    expect(screen.getByTestId('spacing')).toHaveTextContent('5');
    expect(localStorage.getItem('listSpacing')).toBe('5');
  });

  it('loads saved settings from localStorage', () => {
    localStorage.setItem('theme', 'amoledblack');
    localStorage.setItem('openLinkInNewTab', 'true');
    localStorage.setItem('titleFontSize', '24');
    localStorage.setItem('listSpacing', '10');

    renderWithProvider();
    expect(screen.getByTestId('theme')).toHaveTextContent('amoledblack');
    expect(screen.getByTestId('openLinkInNewTab')).toHaveTextContent('true');
    expect(screen.getByTestId('fontSize')).toHaveTextContent('24');
    expect(screen.getByTestId('spacing')).toHaveTextContent('10');
  });

  it('throws when useSettings is used outside SettingsProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(
      'useSettings must be used within a SettingsProvider'
    );
    consoleSpy.mockRestore();
  });
});
