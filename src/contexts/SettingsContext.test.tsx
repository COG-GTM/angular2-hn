import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SettingsProvider, useSettings } from './SettingsContext';

function TestConsumer() {
  const { settings, setTheme, setFont, setSpacing, toggleOpenLinksInNewTab, toggleSettings } = useSettings();
  return (
    <div>
      <span data-testid="theme">{settings.theme}</span>
      <span data-testid="font">{settings.titleFontSize}</span>
      <span data-testid="spacing">{settings.listSpacing}</span>
      <span data-testid="newtab">{String(settings.openLinkInNewTab)}</span>
      <span data-testid="show">{String(settings.showSettings)}</span>
      <button onClick={() => setTheme('night')}>set-theme</button>
      <button onClick={() => setFont('20')}>set-font</button>
      <button onClick={() => setSpacing('8')}>set-spacing</button>
      <button onClick={toggleOpenLinksInNewTab}>toggle-newtab</button>
      <button onClick={toggleSettings}>toggle-show</button>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches: false,
      media: '(prefers-color-scheme: dark)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
  );
});

describe('SettingsProvider', () => {
  it('provides defaults when localStorage is empty', () => {
    render(
      <SettingsProvider>
        <TestConsumer />
      </SettingsProvider>
    );
    expect(screen.getByTestId('theme')).toHaveTextContent('default');
    expect(screen.getByTestId('font')).toHaveTextContent('16');
    expect(screen.getByTestId('spacing')).toHaveTextContent('0');
    expect(screen.getByTestId('newtab')).toHaveTextContent('false');
    expect(screen.getByTestId('show')).toHaveTextContent('false');
  });

  it('reads persisted settings from localStorage', () => {
    localStorage.setItem('theme', 'amoledblack');
    localStorage.setItem('titleFontSize', '22');
    localStorage.setItem('listSpacing', '4');
    localStorage.setItem('openLinkInNewTab', 'true');

    render(
      <SettingsProvider>
        <TestConsumer />
      </SettingsProvider>
    );
    expect(screen.getByTestId('theme')).toHaveTextContent('amoledblack');
    expect(screen.getByTestId('font')).toHaveTextContent('22');
    expect(screen.getByTestId('spacing')).toHaveTextContent('4');
    expect(screen.getByTestId('newtab')).toHaveTextContent('true');
  });

  it('updates state and persists changes', () => {
    render(
      <SettingsProvider>
        <TestConsumer />
      </SettingsProvider>
    );

    act(() => screen.getByText('set-theme').click());
    expect(screen.getByTestId('theme')).toHaveTextContent('night');
    expect(localStorage.getItem('theme')).toBe('night');

    act(() => screen.getByText('set-font').click());
    expect(localStorage.getItem('titleFontSize')).toBe('20');

    act(() => screen.getByText('set-spacing').click());
    expect(localStorage.getItem('listSpacing')).toBe('8');

    act(() => screen.getByText('toggle-newtab').click());
    expect(screen.getByTestId('newtab')).toHaveTextContent('true');
    expect(localStorage.getItem('openLinkInNewTab')).toBe('true');

    act(() => screen.getByText('toggle-show').click());
    expect(screen.getByTestId('show')).toHaveTextContent('true');
  });
});
