import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsProvider, useSettings } from '../context/SettingsContext';

// Helper component to test the context
const TestConsumer: React.FC = () => {
  const { settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing } = useSettings();
  return (
    <div>
      <span data-testid="theme">{settings.theme}</span>
      <span data-testid="showSettings">{settings.showSettings.toString()}</span>
      <span data-testid="openLinkInNewTab">{settings.openLinkInNewTab.toString()}</span>
      <span data-testid="titleFontSize">{settings.titleFontSize}</span>
      <span data-testid="listSpacing">{settings.listSpacing}</span>
      <button data-testid="toggleSettings" onClick={toggleSettings}>Toggle Settings</button>
      <button data-testid="toggleLinks" onClick={toggleOpenLinksInNewTab}>Toggle Links</button>
      <button data-testid="setNight" onClick={() => setTheme('night')}>Night</button>
      <button data-testid="setFont" onClick={() => setFont('20')}>Set Font</button>
      <button data-testid="setSpacing" onClick={() => setSpacing('5')}>Set Spacing</button>
    </div>
  );
};

describe('SettingsContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should provide default settings', () => {
    render(
      <SettingsProvider>
        <TestConsumer />
      </SettingsProvider>
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('default');
    expect(screen.getByTestId('showSettings')).toHaveTextContent('false');
    expect(screen.getByTestId('openLinkInNewTab')).toHaveTextContent('false');
    expect(screen.getByTestId('titleFontSize')).toHaveTextContent('16');
    expect(screen.getByTestId('listSpacing')).toHaveTextContent('0');
  });

  it('should toggle settings visibility', async () => {
    const user = userEvent.setup();
    render(
      <SettingsProvider>
        <TestConsumer />
      </SettingsProvider>
    );

    expect(screen.getByTestId('showSettings')).toHaveTextContent('false');
    await user.click(screen.getByTestId('toggleSettings'));
    expect(screen.getByTestId('showSettings')).toHaveTextContent('true');
  });

  it('should toggle open links in new tab', async () => {
    const user = userEvent.setup();
    render(
      <SettingsProvider>
        <TestConsumer />
      </SettingsProvider>
    );

    await user.click(screen.getByTestId('toggleLinks'));
    expect(screen.getByTestId('openLinkInNewTab')).toHaveTextContent('true');
    expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
  });

  it('should change theme', async () => {
    const user = userEvent.setup();
    render(
      <SettingsProvider>
        <TestConsumer />
      </SettingsProvider>
    );

    await user.click(screen.getByTestId('setNight'));
    expect(screen.getByTestId('theme')).toHaveTextContent('night');
    expect(localStorage.getItem('theme')).toBe('night');
  });

  it('should change font size', async () => {
    const user = userEvent.setup();
    render(
      <SettingsProvider>
        <TestConsumer />
      </SettingsProvider>
    );

    await user.click(screen.getByTestId('setFont'));
    expect(screen.getByTestId('titleFontSize')).toHaveTextContent('20');
    expect(localStorage.getItem('titleFontSize')).toBe('20');
  });

  it('should change list spacing', async () => {
    const user = userEvent.setup();
    render(
      <SettingsProvider>
        <TestConsumer />
      </SettingsProvider>
    );

    await user.click(screen.getByTestId('setSpacing'));
    expect(screen.getByTestId('listSpacing')).toHaveTextContent('5');
    expect(localStorage.getItem('listSpacing')).toBe('5');
  });

  it('should load settings from localStorage', () => {
    localStorage.setItem('openLinkInNewTab', 'true');
    localStorage.setItem('theme', 'night');
    localStorage.setItem('titleFontSize', '20');
    localStorage.setItem('listSpacing', '10');

    render(
      <SettingsProvider>
        <TestConsumer />
      </SettingsProvider>
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('night');
    expect(screen.getByTestId('openLinkInNewTab')).toHaveTextContent('true');
    expect(screen.getByTestId('titleFontSize')).toHaveTextContent('20');
    expect(screen.getByTestId('listSpacing')).toHaveTextContent('10');
  });
});
