import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import type { ReactNode } from 'react';
import { SettingsProvider, useSettings } from './SettingsContext';

function wrapper({ children }: { children: ReactNode }) {
  return <SettingsProvider>{children}</SettingsProvider>;
}

describe('SettingsContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides default settings when localStorage is empty', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });

    expect(result.current.settings).toMatchObject({
      showSettings: false,
      openLinkInNewTab: false,
      theme: 'default',
      titleFontSize: '16',
      listSpacing: '0',
    });
  });

  it('initializes from localStorage', () => {
    localStorage.setItem('theme', 'amoledblack');
    localStorage.setItem('titleFontSize', '20');
    localStorage.setItem('listSpacing', '5');
    localStorage.setItem('openLinkInNewTab', 'true');

    const { result } = renderHook(() => useSettings(), { wrapper });

    expect(result.current.settings).toMatchObject({
      openLinkInNewTab: true,
      theme: 'amoledblack',
      titleFontSize: '20',
      listSpacing: '5',
    });
  });

  it('setTheme updates state and persists to localStorage', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });

    act(() => result.current.setTheme('night'));

    expect(result.current.settings.theme).toBe('night');
    expect(localStorage.getItem('theme')).toBe('night');
  });

  it('toggleOpenLinksInNewTab flips and persists the value', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });

    act(() => result.current.toggleOpenLinksInNewTab());

    expect(result.current.settings.openLinkInNewTab).toBe(true);
    expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
  });

  it('toggleSettings flips the visibility flag without persisting', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });

    act(() => result.current.toggleSettings());

    expect(result.current.settings.showSettings).toBe(true);
  });
});
