import { act, renderHook } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { SettingsProvider, useSettings } from './SettingsProvider';

it('provides defaults and persists all controls except visibility', () => {
  const { result } = renderHook(useSettings, { wrapper: SettingsProvider });
  expect(result.current.settings).toEqual({ showSettings: false, openLinkInNewTab: false, theme: 'default', titleFontSize: '16', listSpacing: '0' });
  act(() => {
    result.current.toggleSettings();
    result.current.toggleOpenLinksInNewTab();
    result.current.setTheme('amoled');
    result.current.setFont('20');
    result.current.setSpacing('8');
  });
  expect(result.current.settings).toEqual({ showSettings: true, openLinkInNewTab: true, theme: 'amoled', titleFontSize: '20', listSpacing: '8' });
  expect(localStorage.getItem('showSettings')).toBeNull();
  expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
  expect(localStorage.getItem('theme')).toBe('amoledblack');
  expect(localStorage.getItem('titleFontSize')).toBe('20');
  expect(localStorage.getItem('listSpacing')).toBe('8');
  act(() => { result.current.toggleSettings(); result.current.toggleOpenLinksInNewTab(); });
  expect(result.current.settings.showSettings).toBe(false);
  expect(localStorage.getItem('openLinkInNewTab')).toBe('false');
});
it('restores saved values and maps legacy AMOLED theme', () => {
  localStorage.setItem('theme', 'amoledblack');
  localStorage.setItem('titleFontSize', '19');
  localStorage.setItem('listSpacing', '2');
  localStorage.setItem('openLinkInNewTab', 'true');
  const { result } = renderHook(useSettings, { wrapper: SettingsProvider });
  expect(result.current.settings).toMatchObject({ theme: 'amoled', titleFontSize: '19', listSpacing: '2', openLinkInNewTab: true });
});
it('initializes from system preference, follows changes even with a saved theme, and cleans up', () => {
  const addEventListener = vi.fn();
  const removeEventListener = vi.fn();
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true, addEventListener, removeEventListener })));
  const { result, unmount } = renderHook(useSettings, { wrapper: SettingsProvider });
  expect(result.current.settings.theme).toBe('night');
  expect(localStorage.getItem('theme')).toBe('night');
  const listener = addEventListener.mock.calls[0][1] as (event: { matches: boolean }) => void;
  act(() => result.current.setTheme('amoled'));
  act(() => listener({ matches: false }));
  expect(result.current.settings.theme).toBe('default');
  expect(localStorage.getItem('theme')).toBe('default');
  unmount();
  expect(removeEventListener).toHaveBeenCalledWith('change', listener);
});
it('prefers a saved theme over system preference', () => {
  localStorage.setItem('theme', 'default');
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
  const { result } = renderHook(useSettings, { wrapper: SettingsProvider });
  expect(result.current.settings.theme).toBe('default');
});
it('requires a provider', () => {
  const quiet = vi.spyOn(console, 'error').mockImplementation(() => {});
  expect(() => renderHook(useSettings)).toThrow('within SettingsProvider');
  quiet.mockRestore();
});
