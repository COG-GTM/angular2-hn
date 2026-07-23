// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SettingsProvider, useSettings } from './SettingsContext';

type ChangeListener = (event: MediaQueryListEvent) => void;

let changeListeners: ChangeListener[];
let prefersDark: boolean;

function mockMatchMedia() {
  changeListeners = [];
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: prefersDark,
    media: query,
    onchange: null,
    addEventListener: (_type: string, listener: ChangeListener) => {
      changeListeners.push(listener);
    },
    removeEventListener: (_type: string, listener: ChangeListener) => {
      changeListeners = changeListeners.filter((l) => l !== listener);
    },
    dispatchEvent: vi.fn(),
  }));
}

function wrapper({ children }: { children: ReactNode }) {
  return <SettingsProvider>{children}</SettingsProvider>;
}

function renderSettings() {
  return renderHook(() => useSettings(), { wrapper });
}

beforeEach(() => {
  localStorage.clear();
  prefersDark = false;
  mockMatchMedia();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useSettings', () => {
  it('throws when used outside a SettingsProvider', () => {
    expect(() => renderHook(() => useSettings())).toThrow(
      'useSettings must be used within a SettingsProvider'
    );
  });

  it('uses defaults when localStorage is empty', () => {
    const { result } = renderSettings();
    expect(result.current.settings).toEqual({
      showSettings: false,
      openLinkInNewTab: false,
      theme: 'default',
      titleFontSize: '16',
      listSpacing: '0',
    });
  });

  it('defaults theme to night when system prefers dark', () => {
    prefersDark = true;
    const { result } = renderSettings();
    expect(result.current.settings.theme).toBe('night');
  });

  it('initializes from localStorage when values are present', () => {
    localStorage.setItem('openLinkInNewTab', 'true');
    localStorage.setItem('theme', 'day');
    localStorage.setItem('titleFontSize', '18');
    localStorage.setItem('listSpacing', '8');
    const { result } = renderSettings();
    expect(result.current.settings).toEqual({
      showSettings: false,
      openLinkInNewTab: true,
      theme: 'day',
      titleFontSize: '18',
      listSpacing: '8',
    });
  });

  it('toggleSettings flips showSettings without persisting', () => {
    const { result } = renderSettings();
    act(() => result.current.toggleSettings());
    expect(result.current.settings.showSettings).toBe(true);
    act(() => result.current.toggleSettings());
    expect(result.current.settings.showSettings).toBe(false);
    expect(localStorage.getItem('showSettings')).toBeNull();
  });

  it('toggleOpenLinksInNewTab toggles and persists JSON', () => {
    const { result } = renderSettings();
    act(() => result.current.toggleOpenLinksInNewTab());
    expect(result.current.settings.openLinkInNewTab).toBe(true);
    expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    act(() => result.current.toggleOpenLinksInNewTab());
    expect(result.current.settings.openLinkInNewTab).toBe(false);
    expect(localStorage.getItem('openLinkInNewTab')).toBe('false');
  });

  it('setTheme updates state and persists', () => {
    const { result } = renderSettings();
    act(() => result.current.setTheme('night'));
    expect(result.current.settings.theme).toBe('night');
    expect(localStorage.getItem('theme')).toBe('night');
  });

  it('setFont updates state and persists', () => {
    const { result } = renderSettings();
    act(() => result.current.setFont('20'));
    expect(result.current.settings.titleFontSize).toBe('20');
    expect(localStorage.getItem('titleFontSize')).toBe('20');
  });

  it('setSpacing updates state and persists', () => {
    const { result } = renderSettings();
    act(() => result.current.setSpacing('4'));
    expect(result.current.settings.listSpacing).toBe('4');
    expect(localStorage.getItem('listSpacing')).toBe('4');
  });

  it('reacts to system color-scheme changes and persists the theme', () => {
    const { result } = renderSettings();
    act(() => {
      changeListeners.forEach((listener) =>
        listener({ matches: true } as MediaQueryListEvent)
      );
    });
    expect(result.current.settings.theme).toBe('night');
    expect(localStorage.getItem('theme')).toBe('night');
    act(() => {
      changeListeners.forEach((listener) =>
        listener({ matches: false } as MediaQueryListEvent)
      );
    });
    expect(result.current.settings.theme).toBe('default');
    expect(localStorage.getItem('theme')).toBe('default');
  });

  it('removes the media query listener on unmount', () => {
    const { unmount } = renderSettings();
    expect(changeListeners.length).toBe(1);
    unmount();
    expect(changeListeners.length).toBe(0);
  });
});
