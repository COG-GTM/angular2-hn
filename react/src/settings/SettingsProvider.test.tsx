import { act, cleanup, render, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mockMatchMedia } from '../test/matchMedia';
import { useSettings } from './SettingsContext';
import { SettingsProvider } from './SettingsProvider';
import type { SettingsApi } from './types';

let api: SettingsApi;

function Probe() {
  api = useSettings();
  return <div data-testid="settings">{JSON.stringify(api.settings)}</div>;
}

function renderProvider() {
  render(
    <StrictMode>
      <SettingsProvider>
        <Probe />
      </SettingsProvider>
    </StrictMode>,
  );
}

beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('SettingsProvider init', () => {
  it('uses defaults with an empty localStorage and a light system scheme, persisting the theme', () => {
    mockMatchMedia(false);
    renderProvider();
    expect(api.settings).toEqual({
      showSettings: false,
      openLinkInNewTab: false,
      theme: 'default',
      titleFontSize: '16',
      listSpacing: '0',
    });
    expect(localStorage.getItem('theme')).toBe('default');
    expect(localStorage.getItem('openLinkInNewTab')).toBeNull();
    expect(localStorage.getItem('titleFontSize')).toBeNull();
    expect(localStorage.getItem('listSpacing')).toBeNull();
  });

  it('falls back to night when the system prefers a dark color scheme', () => {
    mockMatchMedia(true);
    renderProvider();
    expect(api.settings.theme).toBe('night');
    expect(localStorage.getItem('theme')).toBe('night');
  });

  it('prefers the saved theme over the system color scheme', () => {
    mockMatchMedia(true);
    localStorage.setItem('theme', 'amoledblack');
    renderProvider();
    expect(api.settings.theme).toBe('amoledblack');
    expect(localStorage.getItem('theme')).toBe('amoledblack');
  });

  it('restores saved link, font and spacing settings', () => {
    mockMatchMedia(false);
    localStorage.setItem('openLinkInNewTab', 'true');
    localStorage.setItem('titleFontSize', '20');
    localStorage.setItem('listSpacing', '5');
    renderProvider();
    expect(api.settings).toMatchObject({ openLinkInNewTab: true, titleFontSize: '20', listSpacing: '5' });
  });

  it('works without matchMedia support', () => {
    vi.stubGlobal('matchMedia', undefined);
    renderProvider();
    expect(api.settings.theme).toBe('default');
  });
});

describe('SettingsProvider system color scheme listener', () => {
  it('applies and persists live changes even when a theme is saved', () => {
    const mql = mockMatchMedia(false);
    localStorage.setItem('theme', 'amoledblack');
    renderProvider();
    act(() => mql.emit(true));
    expect(api.settings.theme).toBe('night');
    expect(localStorage.getItem('theme')).toBe('night');
    act(() => mql.emit(false));
    expect(api.settings.theme).toBe('default');
    expect(localStorage.getItem('theme')).toBe('default');
  });

  it('removes its listener on unmount', () => {
    const mql = mockMatchMedia(false);
    const { unmount } = render(
      <SettingsProvider>
        <Probe />
      </SettingsProvider>,
    );
    expect(mql.listeners.size).toBe(1);
    unmount();
    expect(mql.listeners.size).toBe(0);
  });
});

describe('SettingsProvider actions', () => {
  beforeEach(() => {
    mockMatchMedia(false);
    renderProvider();
  });

  it('toggles the settings popup without persisting it', () => {
    act(() => api.toggleSettings());
    expect(api.settings.showSettings).toBe(true);
    act(() => api.toggleSettings());
    expect(api.settings.showSettings).toBe(false);
    expect(localStorage.getItem('showSettings')).toBeNull();
  });

  it('toggles and persists openLinkInNewTab as JSON', () => {
    act(() => api.toggleOpenLinksInNewTab());
    expect(api.settings.openLinkInNewTab).toBe(true);
    expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    act(() => api.toggleOpenLinksInNewTab());
    expect(api.settings.openLinkInNewTab).toBe(false);
    expect(localStorage.getItem('openLinkInNewTab')).toBe('false');
  });

  it('sets and persists theme, font size and list spacing', () => {
    act(() => api.setTheme('amoledblack'));
    act(() => api.setFont('22'));
    act(() => api.setSpacing('3'));
    expect(screen.getByTestId('settings')).toHaveTextContent('"theme":"amoledblack"');
    expect(api.settings).toMatchObject({ theme: 'amoledblack', titleFontSize: '22', listSpacing: '3' });
    expect(localStorage.getItem('theme')).toBe('amoledblack');
    expect(localStorage.getItem('titleFontSize')).toBe('22');
    expect(localStorage.getItem('listSpacing')).toBe('3');
  });
});
