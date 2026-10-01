import { act, renderHook } from '@testing-library/react';
import { StrictMode, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS } from '../types/settings';
import { DARK_COLOR_SCHEME_QUERY, SETTINGS_STORAGE_KEYS, SettingsProvider, useSettings } from './useSettings';

/** Controllable `prefers-color-scheme: dark` media query. */
function mockColorScheme(initiallyDark: boolean) {
  const listeners = new Set<(e: MediaQueryListEvent) => void>();
  const state = { matches: initiallyDark };
  const media = {
    get matches() {
      return state.matches;
    },
    media: DARK_COLOR_SCHEME_QUERY,
    addEventListener: vi.fn((_: string, l: (e: MediaQueryListEvent) => void) => listeners.add(l)),
    removeEventListener: vi.fn((_: string, l: (e: MediaQueryListEvent) => void) => listeners.delete(l)),
  };
  const matchMedia = vi.fn(() => media as unknown as MediaQueryList);
  vi.stubGlobal('matchMedia', matchMedia);
  return {
    matchMedia,
    media,
    listenerCount: () => listeners.size,
    setDark(dark: boolean) {
      state.matches = dark;
      act(() => listeners.forEach((l) => l({ matches: dark, media: DARK_COLOR_SCHEME_QUERY } as MediaQueryListEvent)));
    },
  };
}

const wrapper = ({ children }: { children: ReactNode }) => (
  <StrictMode>
    <SettingsProvider>{children}</SettingsProvider>
  </StrictMode>
);

const renderSettings = () => renderHook(() => useSettings(), { wrapper });

beforeEach(() => localStorage.clear());
afterEach(() => vi.unstubAllGlobals());

describe('storage keys', () => {
  it('match settings.service.ts', () => {
    expect(SETTINGS_STORAGE_KEYS).toEqual({
      theme: 'theme',
      titleFontSize: 'titleFontSize',
      listSpacing: 'listSpacing',
      openLinkInNewTab: 'openLinkInNewTab',
    });
  });
});

describe('initial settings', () => {
  it('uses Angular defaults with empty storage and a light system scheme', () => {
    const scheme = mockColorScheme(false);
    const { result } = renderSettings();

    expect(result.current.settings).toEqual(DEFAULT_SETTINGS);
    expect(scheme.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
  });

  it('persists only the system-derived theme on first load (like initTheme)', () => {
    mockColorScheme(false);
    renderSettings();
    expect({ ...localStorage }).toEqual({ theme: 'default' });
  });

  it('picks night when the system prefers dark and nothing is saved', () => {
    mockColorScheme(true);
    const { result } = renderSettings();
    expect(result.current.settings.theme).toBe('night');
    expect(localStorage.getItem('theme')).toBe('night');
  });

  it('restores every persisted value, preferring a saved theme over the system scheme', () => {
    mockColorScheme(true);
    localStorage.setItem('theme', 'amoledblack');
    localStorage.setItem('titleFontSize', '22');
    localStorage.setItem('listSpacing', '8');
    localStorage.setItem('openLinkInNewTab', 'true');

    const { result } = renderSettings();

    expect(result.current.settings).toEqual({
      showSettings: false,
      theme: 'amoledblack',
      titleFontSize: '22',
      listSpacing: '8',
      openLinkInNewTab: true,
    });
  });

  it('treats empty stored strings as unset, like the Angular truthiness checks', () => {
    mockColorScheme(false);
    localStorage.setItem('titleFontSize', '');
    localStorage.setItem('listSpacing', '');
    localStorage.setItem('openLinkInNewTab', 'false');

    const { result } = renderSettings();

    expect(result.current.settings).toMatchObject({ titleFontSize: '16', listSpacing: '0', openLinkInNewTab: false });
  });
});

describe('mutators', () => {
  beforeEach(() => mockColorScheme(false));

  it('toggleSettings flips showSettings without persisting it', () => {
    const { result } = renderSettings();
    act(() => result.current.toggleSettings());
    expect(result.current.settings.showSettings).toBe(true);
    act(() => result.current.toggleSettings());
    expect(result.current.settings.showSettings).toBe(false);
    expect(localStorage.getItem('showSettings')).toBeNull();
  });

  it('toggleOpenLinksInNewTab stores JSON booleans', () => {
    const { result } = renderSettings();
    act(() => result.current.toggleOpenLinksInNewTab());
    expect(result.current.settings.openLinkInNewTab).toBe(true);
    expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    act(() => result.current.toggleOpenLinksInNewTab());
    expect(result.current.settings.openLinkInNewTab).toBe(false);
    expect(localStorage.getItem('openLinkInNewTab')).toBe('false');
  });

  it.each(['default', 'night', 'amoledblack'] as const)('setTheme(%s) stores the theme class name', (theme) => {
    const { result } = renderSettings();
    act(() => result.current.setTheme(theme));
    expect(result.current.settings.theme).toBe(theme);
    expect(localStorage.getItem('theme')).toBe(theme);
  });

  it('setFont and setSpacing store raw strings', () => {
    const { result } = renderSettings();
    act(() => result.current.setFont('18'));
    act(() => result.current.setSpacing('3'));
    expect(result.current.settings).toMatchObject({ titleFontSize: '18', listSpacing: '3' });
    expect(localStorage.getItem('titleFontSize')).toBe('18');
    expect(localStorage.getItem('listSpacing')).toBe('3');
  });

  it('shares state between consumers of the same provider', () => {
    const { result } = renderHook(() => [useSettings(), useSettings()] as const, { wrapper });
    act(() => result.current[0].setFont('30'));
    expect(result.current[1].settings.titleFontSize).toBe('30');
  });
});

describe('prefers-color-scheme sync', () => {
  it('switches between night and default when the system scheme changes', () => {
    const scheme = mockColorScheme(false);
    const { result } = renderSettings();

    scheme.setDark(true);
    expect(result.current.settings.theme).toBe('night');
    expect(localStorage.getItem('theme')).toBe('night');

    scheme.setDark(false);
    expect(result.current.settings.theme).toBe('default');
    expect(localStorage.getItem('theme')).toBe('default');
  });

  it('overrides a saved theme when the system scheme changes (same as Angular)', () => {
    localStorage.setItem('theme', 'amoledblack');
    const scheme = mockColorScheme(false);
    const { result } = renderSettings();
    expect(result.current.settings.theme).toBe('amoledblack');

    scheme.setDark(true);
    expect(result.current.settings.theme).toBe('night');
  });

  it('removes its listener on unmount', () => {
    const scheme = mockColorScheme(false);
    const { unmount } = renderSettings();
    expect(scheme.listenerCount()).toBe(1);
    unmount();
    expect(scheme.listenerCount()).toBe(0);
  });
});

describe('useSettings', () => {
  it('throws outside a provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useSettings())).toThrow(/SettingsProvider/);
  });
});
