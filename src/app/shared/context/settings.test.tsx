import { act, render, renderHook, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { emitColorSchemeChange, setPrefersDarkColorScheme } from '../../../test/matchMedia';
import { SettingsProvider } from './SettingsProvider';
import { useSettings } from './useSettings';

const wrapper = ({ children }: { children: ReactNode }) => <SettingsProvider>{children}</SettingsProvider>;

function renderSettings() {
  return renderHook(() => useSettings(), { wrapper });
}

describe('SettingsProvider', () => {
  it('starts from the documented defaults', () => {
    const { result } = renderSettings();

    expect(result.current.settings).toEqual({
      showSettings: false,
      openLinkInNewTab: false,
      theme: 'default',
      titleFontSize: '16',
      listSpacing: '0',
    });
  });

  it('restores persisted settings', () => {
    localStorage.setItem('openLinkInNewTab', 'true');
    localStorage.setItem('theme', 'amoledblack');
    localStorage.setItem('titleFontSize', '20');
    localStorage.setItem('listSpacing', '5');

    const { result } = renderSettings();

    expect(result.current.settings).toEqual({
      showSettings: false,
      openLinkInNewTab: true,
      theme: 'amoledblack',
      titleFontSize: '20',
      listSpacing: '5',
    });
  });

  it('falls back to the night theme when the system prefers dark', () => {
    setPrefersDarkColorScheme(true);

    const { result } = renderSettings();

    expect(result.current.settings.theme).toBe('night');
  });

  it('keeps a stored theme even when the system prefers dark', () => {
    setPrefersDarkColorScheme(true);
    localStorage.setItem('theme', 'default');

    const { result } = renderSettings();

    expect(result.current.settings.theme).toBe('default');
  });

  it('follows later system color scheme changes', () => {
    const { result } = renderSettings();

    act(() => emitColorSchemeChange(true));
    expect(result.current.settings.theme).toBe('night');

    act(() => emitColorSchemeChange(false));
    expect(result.current.settings.theme).toBe('default');
  });

  it('persists every setting it changes', () => {
    const { result } = renderSettings();

    act(() => result.current.setTheme('night'));
    act(() => result.current.toggleOpenLinksInNewTab());
    act(() => result.current.setFont('22'));
    act(() => result.current.setSpacing('4'));

    expect(result.current.settings).toMatchObject({
      theme: 'night',
      openLinkInNewTab: true,
      titleFontSize: '22',
      listSpacing: '4',
    });
    expect(localStorage.getItem('theme')).toBe('night');
    expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    expect(localStorage.getItem('titleFontSize')).toBe('22');
    expect(localStorage.getItem('listSpacing')).toBe('4');
  });

  it('toggles the settings panel without persisting it', () => {
    const { result } = renderSettings();

    act(() => result.current.toggleSettings());
    expect(result.current.settings.showSettings).toBe(true);

    act(() => result.current.toggleSettings());
    expect(result.current.settings.showSettings).toBe(false);
    expect(localStorage.getItem('showSettings')).toBeNull();
  });

  it('toggles link behaviour back off', () => {
    const { result } = renderSettings();

    act(() => result.current.toggleOpenLinksInNewTab());
    act(() => result.current.toggleOpenLinksInNewTab());

    expect(result.current.settings.openLinkInNewTab).toBe(false);
    expect(localStorage.getItem('openLinkInNewTab')).toBe('false');
  });
});

describe('useSettings', () => {
  it('fails outside of a provider', () => {
    function Consumer() {
      useSettings();
      return null;
    }

    expect(() => render(<Consumer />)).toThrow('useSettings must be used within a SettingsProvider');
    expect(screen.queryByRole('button')).toBeNull();
  });
});
