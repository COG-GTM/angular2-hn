import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';

import { mockMatchMedia } from '../../../test/utils';
import { useSettings } from './settingsContext';
import { SettingsProvider } from './SettingsProvider';

const wrapper = ({ children }: { children: ReactNode }) => <SettingsProvider>{children}</SettingsProvider>;

describe('SettingsProvider', () => {
  it('uses defaults and the system light theme when nothing is stored', () => {
    mockMatchMedia(false);
    const { result } = renderHook(useSettings, { wrapper });

    expect(result.current.settings).toEqual({
      showSettings: false,
      openLinkInNewTab: false,
      theme: 'default',
      titleFontSize: '16',
      listSpacing: '0',
    });
  });

  it('uses the night theme when the system prefers dark mode', () => {
    mockMatchMedia(true);
    const { result } = renderHook(useSettings, { wrapper });
    expect(result.current.settings.theme).toBe('night');
  });

  it('restores stored preferences over the system theme', () => {
    mockMatchMedia(true);
    localStorage.setItem('theme', 'amoledblack');
    localStorage.setItem('openLinkInNewTab', 'true');
    localStorage.setItem('titleFontSize', '20');
    localStorage.setItem('listSpacing', '8');

    const { result } = renderHook(useSettings, { wrapper });

    expect(result.current.settings).toMatchObject({
      theme: 'amoledblack',
      openLinkInNewTab: true,
      titleFontSize: '20',
      listSpacing: '8',
    });
  });

  it('persists changes to localStorage', () => {
    mockMatchMedia(false);
    const { result } = renderHook(useSettings, { wrapper });

    act(() => {
      result.current.toggleSettings();
      result.current.toggleOpenLinksInNewTab();
      result.current.setTheme('night');
      result.current.setFont('22');
      result.current.setSpacing('5');
    });

    expect(result.current.settings.showSettings).toBe(true);
    expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    expect(localStorage.getItem('theme')).toBe('night');
    expect(localStorage.getItem('titleFontSize')).toBe('22');
    expect(localStorage.getItem('listSpacing')).toBe('5');
  });

  it('follows system color scheme changes', () => {
    const media = mockMatchMedia(false);
    const { result } = renderHook(useSettings, { wrapper });

    act(() => media.change(true));
    expect(result.current.settings.theme).toBe('night');

    act(() => media.change(false));
    expect(result.current.settings.theme).toBe('default');
  });

  it('throws when used outside the provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(useSettings)).toThrow('useSettings must be used within a SettingsProvider');
  });
});
