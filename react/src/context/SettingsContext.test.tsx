import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { SettingsProvider, useSettings } from './SettingsContext';

const wrapper = ({ children }: { children: ReactNode }) => <SettingsProvider>{children}</SettingsProvider>;

interface MatchMediaMock extends MediaQueryList {
  emit: (matches: boolean) => void;
}

function lastMedia(): MatchMediaMock {
  const results = (window.matchMedia as unknown as { mock: { results: Array<{ value: MatchMediaMock }> } }).mock.results;
  return results[results.length - 1].value;
}

describe('SettingsContext', () => {
  it('falls back to defaults when nothing is stored', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });

    expect(result.current.settings).toMatchObject({
      showSettings: false,
      openLinkInNewTab: false,
      theme: 'default',
      titleFontSize: '16',
      listSpacing: '0',
    });
  });

  it('hydrates from localStorage', () => {
    localStorage.setItem('theme', 'amoledblack');
    localStorage.setItem('titleFontSize', '20');
    localStorage.setItem('listSpacing', '10');
    localStorage.setItem('openLinkInNewTab', 'true');

    const { result } = renderHook(() => useSettings(), { wrapper });

    expect(result.current.settings).toMatchObject({
      openLinkInNewTab: true,
      theme: 'amoledblack',
      titleFontSize: '20',
      listSpacing: '10',
    });
  });

  it('persists every setting change', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });

    act(() => result.current.setTheme('night'));
    act(() => result.current.setFont('18'));
    act(() => result.current.setSpacing('5'));
    act(() => result.current.toggleOpenLinksInNewTab());
    act(() => result.current.toggleSettings());

    expect(localStorage.getItem('theme')).toBe('night');
    expect(localStorage.getItem('titleFontSize')).toBe('18');
    expect(localStorage.getItem('listSpacing')).toBe('5');
    expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    expect(result.current.settings.showSettings).toBe(true);

    act(() => result.current.toggleOpenLinksInNewTab());
    expect(localStorage.getItem('openLinkInNewTab')).toBe('false');
  });

  it('syncs the theme with the system color scheme', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });

    act(() => lastMedia().emit(true));
    expect(result.current.settings.theme).toBe('night');

    act(() => lastMedia().emit(false));
    expect(result.current.settings.theme).toBe('default');
  });

  it('keeps a stored theme instead of the system preference on mount', () => {
    localStorage.setItem('theme', 'amoledblack');

    const { result } = renderHook(() => useSettings(), { wrapper });

    expect(result.current.settings.theme).toBe('amoledblack');
  });

  it('exposes the settings to consumers', async () => {
    function Consumer() {
      const { settings, toggleSettings } = useSettings();
      return (
        <button type="button" onClick={toggleSettings}>
          {settings.showSettings ? 'open' : 'closed'}
        </button>
      );
    }

    render(<Consumer />, { wrapper });
    await userEvent.click(screen.getByRole('button'));

    expect(screen.getByRole('button')).toHaveTextContent('open');
  });

  it('throws when used outside of the provider', () => {
    expect(() => renderHook(() => useSettings())).toThrow('useSettings must be used within a SettingsProvider');
  });
});
