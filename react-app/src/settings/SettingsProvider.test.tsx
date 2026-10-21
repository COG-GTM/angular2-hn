import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';

import { SettingsProvider } from './SettingsProvider';
import { useSettings } from './useSettings';

type Listener = (event: MediaQueryListEvent) => void;

function mockMatchMedia(matches: boolean) {
  const listeners = new Set<Listener>();
  const media = {
    matches,
    media: '(prefers-color-scheme: dark)',
    addEventListener: vi.fn((_: string, l: Listener) => listeners.add(l)),
    removeEventListener: vi.fn((_: string, l: Listener) => listeners.delete(l)),
  };
  vi.stubGlobal('matchMedia', vi.fn(() => media));
  return {
    media,
    emit: (dark: boolean) => listeners.forEach((l) => l({ matches: dark } as MediaQueryListEvent)),
  };
}

const wrapper = ({ children }: { children: ReactNode }) => <SettingsProvider>{children}</SettingsProvider>;

afterEach(() => vi.unstubAllGlobals());

describe('SettingsProvider', () => {
  it('uses Angular defaults and persists the system theme when nothing is saved', () => {
    mockMatchMedia(false);
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

  it('starts in night theme when the system prefers dark', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useSettings(), { wrapper });
    expect(result.current.settings.theme).toBe('night');
    expect(localStorage.getItem('theme')).toBe('night');
  });

  it('reads saved values from localStorage', () => {
    mockMatchMedia(true);
    localStorage.setItem('theme', 'amoledblack');
    localStorage.setItem('titleFontSize', '20');
    localStorage.setItem('listSpacing', '8');
    localStorage.setItem('openLinkInNewTab', 'true');
    const { result } = renderHook(() => useSettings(), { wrapper });
    expect(result.current.settings).toMatchObject({
      theme: 'amoledblack',
      titleFontSize: '20',
      listSpacing: '8',
      openLinkInNewTab: true,
    });
  });

  it('ignores malformed saved values', () => {
    mockMatchMedia(false);
    localStorage.setItem('openLinkInNewTab', 'undefined');
    localStorage.setItem('theme', 'bogus');
    const { result } = renderHook(() => useSettings(), { wrapper });
    expect(result.current.settings).toMatchObject({ openLinkInNewTab: false, theme: 'default' });
  });

  it('follows prefers-color-scheme changes and unsubscribes on unmount', () => {
    const { media, emit } = mockMatchMedia(false);
    const { result, unmount } = renderHook(() => useSettings(), { wrapper });
    act(() => emit(true));
    expect(result.current.settings.theme).toBe('night');
    expect(localStorage.getItem('theme')).toBe('night');
    act(() => emit(false));
    expect(result.current.settings.theme).toBe('default');
    unmount();
    expect(media.removeEventListener).toHaveBeenCalledWith('change', media.addEventListener.mock.calls[0][1]);
  });

  it('setters update state and persist', () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useSettings(), { wrapper });
    act(() => result.current.setTheme('night'));
    act(() => result.current.setFont('22'));
    act(() => result.current.setSpacing('5'));
    act(() => result.current.toggleOpenLinksInNewTab());
    act(() => result.current.toggleSettings());
    expect(result.current.settings).toEqual({
      showSettings: true,
      openLinkInNewTab: true,
      theme: 'night',
      titleFontSize: '22',
      listSpacing: '5',
    });
    expect({ ...localStorage }).toEqual({
      theme: 'night',
      titleFontSize: '22',
      listSpacing: '5',
      openLinkInNewTab: 'true',
    });
  });

  it('works without matchMedia support', () => {
    vi.stubGlobal('matchMedia', undefined);
    const { result } = renderHook(() => useSettings(), { wrapper });
    expect(result.current.settings.theme).toBe('default');
  });

  it('throws outside the provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useSettings())).toThrow('useSettings must be used within <SettingsProvider>');
  });
});
