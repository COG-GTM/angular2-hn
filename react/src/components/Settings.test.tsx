import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { SettingsProvider, useSettings } from '../hooks/useSettings';
import { Settings } from './Settings';

function SettingsProbe() {
  const { settings } = useSettings();
  return <pre data-testid="settings">{JSON.stringify(settings)}</pre>;
}

function renderSettings() {
  render(
    <SettingsProvider>
      <Settings />
      <SettingsProbe />
    </SettingsProvider>,
  );
  return () => JSON.parse(screen.getByTestId('settings').textContent ?? '{}');
}

describe('Settings popup', () => {
  it('reflects current settings', () => {
    renderSettings();
    expect(screen.getByRole('checkbox', { name: /open links in a new tab/i })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: 'Default' })).toBeChecked();
    expect(screen.getByRole('spinbutton', { name: 'Font size:' })).toHaveValue(16);
    expect(screen.getByRole('spinbutton', { name: 'List spacing:' })).toHaveValue(0);
  });

  it('wires every control to the settings API', async () => {
    const user = userEvent.setup();
    const read = renderSettings();

    await user.click(screen.getByRole('checkbox', { name: /open links in a new tab/i }));
    await user.click(screen.getByRole('radio', { name: 'Night' }));
    const font = screen.getByRole('spinbutton', { name: 'Font size:' });
    await user.clear(font);
    await user.type(font, '20');
    const spacing = screen.getByRole('spinbutton', { name: 'List spacing:' });
    await user.clear(spacing);
    await user.type(spacing, '5');

    expect(read()).toMatchObject({ openLinkInNewTab: true, theme: 'night', titleFontSize: '20', listSpacing: '5' });
  });
});
