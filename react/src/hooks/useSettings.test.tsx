import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS } from '../types/settings';
import { SettingsProvider, useSettings } from './useSettings';

const wrapper = ({ children }: { children: ReactNode }) => <SettingsProvider>{children}</SettingsProvider>;

describe('useSettings (T0 placeholder)', () => {
  it('starts from the Angular defaults', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });
    expect(result.current.settings).toEqual(DEFAULT_SETTINGS);
  });

  it('exposes the SettingsService mutators', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });
    act(() => result.current.toggleSettings());
    act(() => result.current.toggleOpenLinksInNewTab());
    act(() => result.current.setTheme('night'));
    act(() => result.current.setFont('20'));
    act(() => result.current.setSpacing('10'));
    expect(result.current.settings).toEqual({
      showSettings: true,
      openLinkInNewTab: true,
      theme: 'night',
      titleFontSize: '20',
      listSpacing: '10',
    });
  });

  it('throws outside a provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useSettings())).toThrow(/SettingsProvider/);
  });
});
