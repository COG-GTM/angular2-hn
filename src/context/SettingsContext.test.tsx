import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsProvider, useSettings } from './SettingsContext';

function HarnessForToggle() {
  const { settings, toggleSettings, toggleOpenLinksInNewTab, setTheme } =
    useSettings();
  return (
    <div>
      <div data-testid="show">{String(settings.showSettings)}</div>
      <div data-testid="new-tab">{String(settings.openLinkInNewTab)}</div>
      <div data-testid="theme">{settings.theme}</div>
      <div data-testid="font">{settings.titleFontSize}</div>
      <div data-testid="spacing">{settings.listSpacing}</div>
      <button onClick={toggleSettings}>toggle-settings</button>
      <button onClick={toggleOpenLinksInNewTab}>toggle-new-tab</button>
      <button onClick={() => setTheme('night')}>set-night</button>
    </div>
  );
}

describe('SettingsContext', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('toggleSettings flips showSettings flag', async () => {
    const user = userEvent.setup();
    render(
      <SettingsProvider>
        <HarnessForToggle />
      </SettingsProvider>
    );
    expect(screen.getByTestId('show').textContent).toBe('false');
    await user.click(screen.getByText('toggle-settings'));
    expect(screen.getByTestId('show').textContent).toBe('true');
  });

  it('toggleOpenLinksInNewTab persists value to localStorage', async () => {
    const user = userEvent.setup();
    render(
      <SettingsProvider>
        <HarnessForToggle />
      </SettingsProvider>
    );
    await user.click(screen.getByText('toggle-new-tab'));
    expect(screen.getByTestId('new-tab').textContent).toBe('true');
    expect(window.localStorage.getItem('openLinkInNewTab')).toBe('true');
  });

  it('setTheme persists value to localStorage', async () => {
    const user = userEvent.setup();
    render(
      <SettingsProvider>
        <HarnessForToggle />
      </SettingsProvider>
    );
    await user.click(screen.getByText('set-night'));
    expect(screen.getByTestId('theme').textContent).toBe('night');
    expect(window.localStorage.getItem('theme')).toBe('night');
  });

  it('reads initial settings from localStorage when present', () => {
    window.localStorage.setItem('theme', 'amoledblack');
    window.localStorage.setItem('openLinkInNewTab', 'true');
    window.localStorage.setItem('titleFontSize', '20');
    window.localStorage.setItem('listSpacing', '4');

    render(
      <SettingsProvider>
        <HarnessForToggle />
      </SettingsProvider>
    );

    expect(screen.getByTestId('theme').textContent).toBe('amoledblack');
    expect(screen.getByTestId('new-tab').textContent).toBe('true');
    expect(screen.getByTestId('font').textContent).toBe('20');
    expect(screen.getByTestId('spacing').textContent).toBe('4');
  });
});
