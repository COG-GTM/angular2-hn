import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useSettings } from '../../context/settings';
import { renderWithProviders } from '../../test/render';
import { Settings } from './Settings';

function SettingsProbe() {
  const { settings } = useSettings();
  return <output data-testid="settings">{JSON.stringify(settings)}</output>;
}

function renderSettings(settings = {}) {
  return renderWithProviders(
    <>
      <Settings />
      <SettingsProbe />
    </>,
    { settings: { showSettings: true, ...settings } }
  );
}

const currentSettings = () => JSON.parse(screen.getByTestId('settings').textContent ?? '{}');

describe('Settings', () => {
  it('renders the same sections, labels and options as Angular', () => {
    renderSettings();
    expect(screen.getByRole('heading', { level: 1, name: 'Settings' })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'Links',
      'Select a theme',
      'Change Font',
    ]);
    expect(screen.getByText(/Open links in a new tab/)).toBeInTheDocument();
    expect(screen.getByLabelText('Default')).toHaveAttribute('value', 'default');
    expect(screen.getByLabelText('Night')).toHaveAttribute('value', 'night');
    expect(screen.getByLabelText('Black (AMOLED)')).toHaveAttribute('value', 'amoledblack');
    expect(screen.getByLabelText('Font size:')).toHaveAttribute('min', '1');
    expect(screen.getByLabelText('List spacing:')).toHaveAttribute('min', '0');
  });

  it('reflects the current settings', () => {
    renderSettings({ openLinkInNewTab: true, theme: 'night', titleFontSize: '20', listSpacing: '5' });
    expect(screen.getByRole('checkbox')).toBeChecked();
    expect(screen.getByLabelText('Night')).toBeChecked();
    expect(screen.getByLabelText('Default')).not.toBeChecked();
    expect(screen.getByLabelText('Font size:')).toHaveValue(20);
    expect(screen.getByLabelText('List spacing:')).toHaveValue(5);
  });

  it('closes via the close button', async () => {
    const user = userEvent.setup();
    renderSettings();
    expect(currentSettings().showSettings).toBe(true);
    await user.click(screen.getByText('×'));
    expect(currentSettings().showSettings).toBe(false);
  });

  it('does not close when the overlay is clicked (same as Angular)', async () => {
    const user = userEvent.setup();
    const { container } = renderSettings();
    await user.click(container.querySelector('.overlay')!);
    expect(currentSettings().showSettings).toBe(true);
  });

  it('toggles opening links in a new tab and persists it', async () => {
    const user = userEvent.setup();
    renderSettings();
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);
    expect(checkbox).toBeChecked();
    expect(currentSettings().openLinkInNewTab).toBe(true);
    expect(localStorage.getItem('openLinkInNewTab')).toBe('true');

    await user.click(checkbox);
    expect(currentSettings().openLinkInNewTab).toBe(false);
    expect(localStorage.getItem('openLinkInNewTab')).toBe('false');
  });

  it.each([
    ['Night', 'night'],
    ['Black (AMOLED)', 'amoledblack'],
    ['Default', 'default'],
  ])('selects the %s theme and persists it', async (label, theme) => {
    const user = userEvent.setup();
    renderSettings({ theme: label === 'Default' ? 'night' : 'default' });
    await user.click(screen.getByLabelText(label));
    expect(screen.getByLabelText(label)).toBeChecked();
    expect(currentSettings().theme).toBe(theme);
    expect(localStorage.getItem('theme')).toBe(theme);
  });

  it('changes the title font size and persists it', async () => {
    const user = userEvent.setup();
    renderSettings();
    const input = screen.getByLabelText('Font size:');
    await user.clear(input);
    await user.type(input, '22');
    expect(input).toHaveValue(22);
    expect(currentSettings().titleFontSize).toBe('22');
    expect(localStorage.getItem('titleFontSize')).toBe('22');
  });

  it('changes the list spacing and persists it', () => {
    renderSettings();
    const input = screen.getByLabelText('List spacing:');
    fireEvent.change(input, { target: { value: '7' } });
    expect(input).toHaveValue(7);
    expect(currentSettings().listSpacing).toBe('7');
    expect(localStorage.getItem('listSpacing')).toBe('7');
  });
});
