import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { SettingsProvider, useSettings } from './SettingsContext';

const wrapper = ({ children }: { children: ReactNode }) => <SettingsProvider>{children}</SettingsProvider>;

function stubMatchMedia(matches: boolean) {
  const listeners: ((e: MediaQueryListEvent) => void)[] = [];
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches,
      media: '(prefers-color-scheme: dark)',
      addEventListener: (_: string, l: (e: MediaQueryListEvent) => void) => listeners.push(l),
      removeEventListener: vi.fn(),
    }))
  );
  return (dark: boolean) => listeners.forEach((l) => l({ matches: dark } as MediaQueryListEvent));
}

describe('SettingsContext', () => {
  it('has Angular defaults', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });
    expect(result.current.settings).toEqual({
      showSettings: false,
      openLinkInNewTab: false,
      theme: 'default',
      titleFontSize: '16',
      listSpacing: '0',
    });
  });

  it('restores persisted settings from localStorage', () => {
    localStorage.setItem('theme', 'amoledblack');
    localStorage.setItem('openLinkInNewTab', 'true');
    localStorage.setItem('titleFontSize', '20');
    localStorage.setItem('listSpacing', '5');
    const { result } = renderHook(() => useSettings(), { wrapper });
    expect(result.current.settings).toMatchObject({
      theme: 'amoledblack',
      openLinkInNewTab: true,
      titleFontSize: '20',
      listSpacing: '5',
    });
  });

  it('persists theme, font, spacing and new-tab changes', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });
    act(() => result.current.setTheme('night'));
    act(() => result.current.setFont('18'));
    act(() => result.current.setSpacing('4'));
    act(() => result.current.toggleOpenLinksInNewTab());
    expect(result.current.settings).toMatchObject({
      theme: 'night',
      titleFontSize: '18',
      listSpacing: '4',
      openLinkInNewTab: true,
    });
    expect(localStorage.getItem('theme')).toBe('night');
    expect(localStorage.getItem('titleFontSize')).toBe('18');
    expect(localStorage.getItem('listSpacing')).toBe('4');
    expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
  });

  it('toggles the settings popup without persisting it', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });
    act(() => result.current.toggleSettings());
    expect(result.current.settings.showSettings).toBe(true);
  });

  it('follows the system dark color scheme when no theme is saved', () => {
    const emit = stubMatchMedia(true);
    const { result } = renderHook(() => useSettings(), { wrapper });
    expect(result.current.settings.theme).toBe('night');
    act(() => emit(false));
    expect(result.current.settings.theme).toBe('default');
  });

  it('throws outside the provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useSettings())).toThrow(/SettingsProvider/);
  });
});
