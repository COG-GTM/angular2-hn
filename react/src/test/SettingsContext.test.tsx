import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { SettingsProvider, useSettings } from '../context/SettingsContext';

function SettingsConsumer() {
  const { settings, toggleOpenLinksInNewTab } = useSettings();
  return <><span>{settings.theme}</span><span>{String(settings.openLinkInNewTab)}</span><button onClick={toggleOpenLinksInNewTab}>toggle</button></>;
}

describe('SettingsProvider', () => {
  beforeEach(() => localStorage.clear());

  it('loads persisted settings and writes changes', async () => {
    localStorage.setItem('theme', 'night');
    localStorage.setItem('openLinkInNewTab', 'true');
    render(<SettingsProvider><SettingsConsumer /></SettingsProvider>);
    expect(screen.getByText('night')).toBeInTheDocument();
    expect(screen.getByText('true')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'toggle' }));
    expect(localStorage.getItem('openLinkInNewTab')).toBe('false');
  });
});
