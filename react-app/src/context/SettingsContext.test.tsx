import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SettingsProvider, useSettings } from './SettingsContext';

type ChangeHandler = (event: MediaQueryListEvent) => void;

let mediaMatches = false;
let changeHandlers: ChangeHandler[] = [];

function installMatchMedia(matches: boolean) {
  mediaMatches = matches;
  changeHandlers = [];
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: mediaMatches,
      media: query,
      addEventListener: (_: string, handler: ChangeHandler) => changeHandlers.push(handler),
      removeEventListener: (_: string, handler: ChangeHandler) => {
        changeHandlers = changeHandlers.filter((h) => h !== handler);
      },
    }))
  );
}

function emitColorSchemeChange(matches: boolean) {
  act(() => {
    changeHandlers.forEach((h) =>
      h({ matches, media: '(prefers-color-scheme: dark)' } as MediaQueryListEvent)
    );
  });
}

function Consumer() {
  const { settings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing } = useSettings();
  return (
    <div>
      <span data-testid="theme">{settings.theme}</span>
      <span data-testid="newtab">{String(settings.openLinkInNewTab)}</span>
      <span data-testid="font">{settings.titleFontSize}</span>
      <span data-testid="spacing">{settings.listSpacing}</span>
      <button onClick={toggleOpenLinksInNewTab}>toggle-newtab</button>
      <button onClick={() => setTheme('amoledblack')}>set-theme</button>
      <button onClick={() => setFont('20')}>set-font</button>
      <button onClick={() => setSpacing('5')}>set-spacing</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <SettingsProvider>
      <Consumer />
    </SettingsProvider>
  );
}

describe('SettingsContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('defaults to the "default" theme when system prefers light and persists it', () => {
    installMatchMedia(false);
    renderWithProvider();
    expect(screen.getByTestId('theme').textContent).toBe('default');
    expect(localStorage.getItem('theme')).toBe('default');
  });

  it('defaults to the "night" theme when system prefers dark', () => {
    installMatchMedia(true);
    renderWithProvider();
    expect(screen.getByTestId('theme').textContent).toBe('night');
  });

  it('uses a saved theme from localStorage instead of the system preference', () => {
    installMatchMedia(true);
    localStorage.setItem('theme', 'amoledblack');
    renderWithProvider();
    expect(screen.getByTestId('theme').textContent).toBe('amoledblack');
  });

  it('reacts to prefers-color-scheme changes', () => {
    installMatchMedia(false);
    renderWithProvider();
    expect(screen.getByTestId('theme').textContent).toBe('default');
    emitColorSchemeChange(true);
    expect(screen.getByTestId('theme').textContent).toBe('night');
    expect(localStorage.getItem('theme')).toBe('night');
  });

  it('reads openLinkInNewTab, titleFontSize and listSpacing from localStorage', () => {
    installMatchMedia(false);
    localStorage.setItem('openLinkInNewTab', 'true');
    localStorage.setItem('titleFontSize', '22');
    localStorage.setItem('listSpacing', '8');
    renderWithProvider();
    expect(screen.getByTestId('newtab').textContent).toBe('true');
    expect(screen.getByTestId('font').textContent).toBe('22');
    expect(screen.getByTestId('spacing').textContent).toBe('8');
  });

  it('persists toggles and inputs to localStorage with the original keys', async () => {
    installMatchMedia(false);
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByText('toggle-newtab'));
    expect(screen.getByTestId('newtab').textContent).toBe('true');
    expect(localStorage.getItem('openLinkInNewTab')).toBe('true');

    await user.click(screen.getByText('set-theme'));
    expect(localStorage.getItem('theme')).toBe('amoledblack');

    await user.click(screen.getByText('set-font'));
    expect(localStorage.getItem('titleFontSize')).toBe('20');

    await user.click(screen.getByText('set-spacing'));
    expect(localStorage.getItem('listSpacing')).toBe('5');
  });
});
