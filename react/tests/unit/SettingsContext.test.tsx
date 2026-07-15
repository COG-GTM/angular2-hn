import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { SettingsProvider, useSettings } from '../../src/context/SettingsContext';

function wrapper({ children }: { children: ReactNode }) {
  return <SettingsProvider>{children}</SettingsProvider>;
}

describe('SettingsContext', () => {
  beforeEach(() => {
    localStorage.clear();
    // default matchMedia mock: prefers light
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('provides defaults when localStorage is empty', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });
    expect(result.current.settings.openLinkInNewTab).toBe(false);
    expect(result.current.settings.theme).toBe('default');
    expect(result.current.settings.titleFontSize).toBe('16');
    expect(result.current.settings.listSpacing).toBe('0');
    expect(result.current.settings.showSettings).toBe(false);
  });

  it('reads persisted values from localStorage', () => {
    localStorage.setItem('openLinkInNewTab', 'true');
    localStorage.setItem('theme', 'amoledblack');
    localStorage.setItem('titleFontSize', '22');
    localStorage.setItem('listSpacing', '5');
    const { result } = renderHook(() => useSettings(), { wrapper });
    expect(result.current.settings.openLinkInNewTab).toBe(true);
    expect(result.current.settings.theme).toBe('amoledblack');
    expect(result.current.settings.titleFontSize).toBe('22');
    expect(result.current.settings.listSpacing).toBe('5');
  });

  it('toggleSettings flips showSettings', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });
    act(() => result.current.toggleSettings());
    expect(result.current.settings.showSettings).toBe(true);
    act(() => result.current.toggleSettings());
    expect(result.current.settings.showSettings).toBe(false);
  });

  it('toggleOpenLinksInNewTab persists to localStorage', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });
    act(() => result.current.toggleOpenLinksInNewTab());
    expect(result.current.settings.openLinkInNewTab).toBe(true);
    expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
  });

  it('setTheme / setFont / setSpacing persist to localStorage', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });
    act(() => result.current.setTheme('night'));
    act(() => result.current.setFont('20'));
    act(() => result.current.setSpacing('8'));
    expect(result.current.settings.theme).toBe('night');
    expect(localStorage.getItem('theme')).toBe('night');
    expect(result.current.settings.titleFontSize).toBe('20');
    expect(localStorage.getItem('titleFontSize')).toBe('20');
    expect(result.current.settings.listSpacing).toBe('8');
    expect(localStorage.getItem('listSpacing')).toBe('8');
  });

  it('auto-selects night when system prefers dark and no saved theme', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: true,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))
    );
    const { result } = renderHook(() => useSettings(), { wrapper });
    expect(result.current.settings.theme).toBe('night');
    expect(localStorage.getItem('theme')).toBe('night');
  });

  it('respects a saved theme over the system preference', () => {
    localStorage.setItem('theme', 'default');
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: true,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))
    );
    const { result } = renderHook(() => useSettings(), { wrapper });
    expect(result.current.settings.theme).toBe('default');
  });
});
