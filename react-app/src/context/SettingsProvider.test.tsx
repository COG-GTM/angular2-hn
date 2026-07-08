import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SettingsProvider, useSettings } from './SettingsProvider';

function Consumer() {
  const {
    settings,
    setTheme,
    setFont,
    setSpacing,
    toggleOpenLinksInNewTab,
  } = useSettings();

  return (
    <div>
      <span data-testid="theme">{settings.theme}</span>
      <span data-testid="font">{settings.titleFontSize}</span>
      <span data-testid="spacing">{settings.listSpacing}</span>
      <span data-testid="newtab">{String(settings.openLinkInNewTab)}</span>
      <button onClick={() => setTheme('night')}>set-theme</button>
      <button onClick={() => setFont('20')}>set-font</button>
      <button onClick={() => setSpacing('5')}>set-spacing</button>
      <button onClick={toggleOpenLinksInNewTab}>toggle-newtab</button>
    </div>
  );
}

function renderProvider() {
  return render(
    <SettingsProvider>
      <Consumer />
    </SettingsProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe('SettingsProvider', () => {
  it('setters update state and persist to localStorage', async () => {
    renderProvider();

    await userEvent.click(screen.getByText('set-theme'));
    expect(screen.getByTestId('theme')).toHaveTextContent('night');
    expect(localStorage.getItem('theme')).toBe('night');

    await userEvent.click(screen.getByText('set-font'));
    expect(screen.getByTestId('font')).toHaveTextContent('20');
    expect(localStorage.getItem('titleFontSize')).toBe('20');

    await userEvent.click(screen.getByText('set-spacing'));
    expect(screen.getByTestId('spacing')).toHaveTextContent('5');
    expect(localStorage.getItem('listSpacing')).toBe('5');

    await userEvent.click(screen.getByText('toggle-newtab'));
    expect(screen.getByTestId('newtab')).toHaveTextContent('true');
    expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
  });

  it('initializes theme from localStorage', () => {
    localStorage.setItem('theme', 'amoledblack');
    renderProvider();
    expect(screen.getByTestId('theme')).toHaveTextContent('amoledblack');
  });
});
