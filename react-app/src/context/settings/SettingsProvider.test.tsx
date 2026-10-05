import type { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';

import { setPrefersDark } from '../../test/setup';
import { SettingsProvider } from './SettingsProvider';
import { useSettings } from './useSettings';

const wrapper = ({ children }: { children: ReactNode }) => <SettingsProvider>{children}</SettingsProvider>;

describe('SettingsProvider', () => {
  it('uses defaults and persists the system-derived theme', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });
    expect(result.current.settings).toEqual({
      showSettings: false,
      openLinkInNewTab: false,
      theme: 'default',
      titleFontSize: '16',
      listSpacing: '0',
    });
    expect(localStorage.getItem('theme')).toBe('default');
  });

  it('picks the night theme when the system prefers dark', () => {
    setPrefersDark(true);
    const { result } = renderHook(() => useSettings(), { wrapper });
    expect(result.current.settings.theme).toBe('night');
  });

  it('restores saved settings from localStorage', () => {
    localStorage.setItem('theme', 'amoledblack');
    localStorage.setItem('openLinkInNewTab', 'true');
    localStorage.setItem('titleFontSize', '20');
    localStorage.setItem('listSpacing', '8');
    const { result } = renderHook(() => useSettings(), { wrapper });
    expect(result.current.settings).toMatchObject({
      theme: 'amoledblack',
      openLinkInNewTab: true,
      titleFontSize: '20',
      listSpacing: '8',
    });
  });

  it('updates and persists every setting', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });
    act(() => {
      result.current.setTheme('night');
      result.current.toggleOpenLinksInNewTab();
      result.current.setFont('18');
      result.current.setSpacing('4');
      result.current.toggleSettings();
    });
    expect(result.current.settings).toEqual({
      showSettings: true,
      openLinkInNewTab: true,
      theme: 'night',
      titleFontSize: '18',
      listSpacing: '4',
    });
    expect(localStorage.getItem('theme')).toBe('night');
    expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    expect(localStorage.getItem('titleFontSize')).toBe('18');
    expect(localStorage.getItem('listSpacing')).toBe('4');
  });

  it('follows system colour scheme changes', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });
    act(() => setPrefersDark(true));
    expect(result.current.settings.theme).toBe('night');
    act(() => setPrefersDark(false));
    expect(result.current.settings.theme).toBe('default');
  });

  it('throws outside the provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useSettings())).toThrow(/SettingsProvider/);
  });
});
