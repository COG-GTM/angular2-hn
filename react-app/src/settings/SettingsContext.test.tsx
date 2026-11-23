import { act, render, screen } from '@testing-library/react';
import { SettingsProvider } from './SettingsContext';
import { useSettings } from './useSettings';
import type { SettingsContextValue } from './settings';

function mockMatchMedia(dark: boolean) {
  const listeners: ((e: MediaQueryListEvent) => void)[] = [];
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: dark,
    media: query,
    addEventListener: (_: string, l: (e: MediaQueryListEvent) => void) => listeners.push(l),
    removeEventListener: vi.fn(),
  }));
  return (matches: boolean) => listeners.forEach((l) => l({ matches } as MediaQueryListEvent));
}

let ctx: SettingsContextValue;
function Probe() {
  ctx = useSettings();
  return <span data-testid="theme">{ctx.theme}</span>;
}
const renderProvider = () => render(<SettingsProvider><Probe /></SettingsProvider>);

afterEach(() => vi.unstubAllGlobals());

describe('SettingsProvider', () => {
  it('defaults match the Angular SettingsService', () => {
    mockMatchMedia(false);
    renderProvider();
    expect(ctx).toMatchObject({ showSettings: false, openLinkInNewTab: false, theme: 'default', titleFontSize: '16', listSpacing: '0' });
    expect(localStorage.getItem('theme')).toBe('default');
  });

  it('follows the system dark scheme when no theme is saved, and its changes', () => {
    const emit = mockMatchMedia(true);
    renderProvider();
    expect(screen.getByTestId('theme')).toHaveTextContent('night');
    act(() => emit(false));
    expect(screen.getByTestId('theme')).toHaveTextContent('default');
    expect(localStorage.getItem('theme')).toBe('default');
  });

  it('reads and writes the same localStorage keys', () => {
    mockMatchMedia(true);
    localStorage.setItem('theme', 'amoledblack');
    localStorage.setItem('openLinkInNewTab', 'true');
    localStorage.setItem('titleFontSize', '20');
    localStorage.setItem('listSpacing', '5');
    renderProvider();
    expect(ctx).toMatchObject({ theme: 'amoledblack', openLinkInNewTab: true, titleFontSize: '20', listSpacing: '5' });
    act(() => {
      ctx.toggleOpenLinksInNewTab();
      ctx.setTheme('night');
      ctx.setFont('18');
      ctx.setSpacing('2');
      ctx.toggleSettings();
    });
    expect(ctx).toMatchObject({ theme: 'night', openLinkInNewTab: false, titleFontSize: '18', listSpacing: '2', showSettings: true });
    expect([localStorage.getItem('openLinkInNewTab'), localStorage.getItem('theme'), localStorage.getItem('titleFontSize'), localStorage.getItem('listSpacing')]).toEqual(['false', 'night', '18', '2']);
  });
});
