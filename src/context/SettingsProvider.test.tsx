import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsProvider } from './SettingsProvider';
import { useSettings } from './useSettings';

function installMatchMedia(initialMatches: boolean) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const mql = {
    matches: initialMatches,
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addEventListener: (_type: string, cb: (event: MediaQueryListEvent) => void) => listeners.add(cb),
    removeEventListener: (_type: string, cb: (event: MediaQueryListEvent) => void) =>
      listeners.delete(cb),
    addListener: (cb: (event: MediaQueryListEvent) => void) => listeners.add(cb),
    removeListener: (cb: (event: MediaQueryListEvent) => void) => listeners.delete(cb),
    dispatchEvent: () => true,
  };
  window.matchMedia = vi.fn().mockReturnValue(mql) as unknown as typeof window.matchMedia;
  return {
    emit(matches: boolean) {
      mql.matches = matches;
      listeners.forEach((cb) => cb({ matches } as MediaQueryListEvent));
    },
  };
}

function Harness() {
  const { settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing } =
    useSettings();
  return (
    <div>
      <span data-testid="theme">{settings.theme}</span>
      <span data-testid="showSettings">{String(settings.showSettings)}</span>
      <span data-testid="openLinkInNewTab">{String(settings.openLinkInNewTab)}</span>
      <span data-testid="titleFontSize">{settings.titleFontSize}</span>
      <span data-testid="listSpacing">{settings.listSpacing}</span>
      <button onClick={toggleSettings}>toggleSettings</button>
      <button onClick={toggleOpenLinksInNewTab}>toggleLinks</button>
      <button onClick={() => setTheme('amoledblack')}>setTheme</button>
      <button onClick={() => setFont('20')}>setFont</button>
      <button onClick={() => setSpacing('10')}>setSpacing</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <SettingsProvider>
      <Harness />
    </SettingsProvider>
  );
}

describe('SettingsProvider', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('system dark-mode selection', () => {
    it('selects night theme when the system prefers dark and no theme is saved', () => {
      installMatchMedia(true);
      renderWithProvider();
      expect(screen.getByTestId('theme')).toHaveTextContent('night');
      expect(localStorage.getItem('theme')).toBe('night');
    });

    it('selects default theme when the system prefers light and no theme is saved', () => {
      installMatchMedia(false);
      renderWithProvider();
      expect(screen.getByTestId('theme')).toHaveTextContent('default');
      expect(localStorage.getItem('theme')).toBe('default');
    });

    it('honors a previously saved theme over the system preference', () => {
      localStorage.setItem('theme', 'amoledblack');
      installMatchMedia(true);
      renderWithProvider();
      expect(screen.getByTestId('theme')).toHaveTextContent('amoledblack');
    });

    it('updates the theme when the system preference changes', () => {
      const media = installMatchMedia(false);
      renderWithProvider();
      expect(screen.getByTestId('theme')).toHaveTextContent('default');
      act(() => media.emit(true));
      expect(screen.getByTestId('theme')).toHaveTextContent('night');
      expect(localStorage.getItem('theme')).toBe('night');
    });
  });

  describe('persistence and toggles', () => {
    beforeEach(() => installMatchMedia(false));

    it('persists the theme when set explicitly', async () => {
      renderWithProvider();
      await userEvent.click(screen.getByText('setTheme'));
      expect(screen.getByTestId('theme')).toHaveTextContent('amoledblack');
      expect(localStorage.getItem('theme')).toBe('amoledblack');
    });

    it('toggles showSettings without persisting it', async () => {
      renderWithProvider();
      expect(screen.getByTestId('showSettings')).toHaveTextContent('false');
      await userEvent.click(screen.getByText('toggleSettings'));
      expect(screen.getByTestId('showSettings')).toHaveTextContent('true');
      expect(localStorage.getItem('showSettings')).toBeNull();
    });

    it('toggles and persists openLinkInNewTab', async () => {
      renderWithProvider();
      expect(screen.getByTestId('openLinkInNewTab')).toHaveTextContent('false');
      await userEvent.click(screen.getByText('toggleLinks'));
      expect(screen.getByTestId('openLinkInNewTab')).toHaveTextContent('true');
      expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    });

    it('persists titleFontSize and listSpacing', async () => {
      renderWithProvider();
      await userEvent.click(screen.getByText('setFont'));
      await userEvent.click(screen.getByText('setSpacing'));
      expect(screen.getByTestId('titleFontSize')).toHaveTextContent('20');
      expect(screen.getByTestId('listSpacing')).toHaveTextContent('10');
      expect(localStorage.getItem('titleFontSize')).toBe('20');
      expect(localStorage.getItem('listSpacing')).toBe('10');
    });

    it('reads initial persisted values on mount', () => {
      localStorage.setItem('openLinkInNewTab', 'true');
      localStorage.setItem('titleFontSize', '18');
      localStorage.setItem('listSpacing', '5');
      renderWithProvider();
      expect(screen.getByTestId('openLinkInNewTab')).toHaveTextContent('true');
      expect(screen.getByTestId('titleFontSize')).toHaveTextContent('18');
      expect(screen.getByTestId('listSpacing')).toHaveTextContent('5');
    });
  });
});
