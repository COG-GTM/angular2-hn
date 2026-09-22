import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SettingsProvider, useSettings } from './SettingsContext';

function setPrefersDark(matches: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
  );
}

function wrapper({ children }: { children: ReactNode }) {
  return <SettingsProvider>{children}</SettingsProvider>;
}

beforeEach(() => {
  setPrefersDark(false);
});

describe('SettingsContext', () => {
  it('falls back to the night theme when the OS prefers dark and nothing is stored', () => {
    setPrefersDark(true);
    const { result } = renderHook(() => useSettings(), { wrapper });

    expect(result.current.settings.theme).toBe('night');
  });

  it('prefers the stored theme over the OS preference', () => {
    setPrefersDark(true);
    localStorage.setItem('theme', 'amoledblack');
    const { result } = renderHook(() => useSettings(), { wrapper });

    expect(result.current.settings.theme).toBe('amoledblack');
  });

  it('persists theme, font size, spacing and link target changes', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });

    act(() => {
      result.current.setTheme('night');
      result.current.setFont('20');
      result.current.setSpacing('8');
      result.current.toggleOpenLinksInNewTab();
    });

    expect(result.current.settings).toMatchObject({
      theme: 'night',
      titleFontSize: '20',
      listSpacing: '8',
      openLinkInNewTab: true,
    });
    expect(localStorage.getItem('theme')).toBe('night');
    expect(localStorage.getItem('titleFontSize')).toBe('20');
    expect(localStorage.getItem('listSpacing')).toBe('8');
    expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
  });

  it('toggles the settings panel without persisting it', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });

    act(() => result.current.toggleSettings());

    expect(result.current.settings.showSettings).toBe(true);
    expect(localStorage.getItem('showSettings')).toBeNull();
  });
});
