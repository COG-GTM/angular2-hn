import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsProvider } from '../../settings/SettingsContext';
import { useSettings } from '../../settings/useSettings';
import type { SettingsContextValue } from '../../settings/settings';
import { Settings } from './Settings';

let ctx: SettingsContextValue;
function Probe() {
  ctx = useSettings();
  return ctx.showSettings ? <Settings /> : null;
}


beforeEach(() => {
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  localStorage.setItem('theme', 'default');
});
afterEach(() => vi.unstubAllGlobals());

function open() {
  const view = render(<SettingsProvider><Probe /></SettingsProvider>);
  act(() => ctx.toggleSettings());
  return view;
}

describe('Settings', () => {
  it('shows the Angular sections and reflects current settings', async () => {
    localStorage.setItem('theme', 'night');
    localStorage.setItem('openLinkInNewTab', 'true');
    localStorage.setItem('titleFontSize', '20');
    localStorage.setItem('listSpacing', '4');
    const { container } = open();
    expect(container.querySelector('#popup1.overlay .popup h1')).toHaveTextContent('Settings');
    expect([...container.querySelectorAll('.popup h2')].map((h) => h.textContent)).toEqual(['Links', 'Select a theme', 'Change Font']);
    expect(screen.getByRole('checkbox')).toBeChecked();
    expect(screen.getByLabelText('Night')).toBeChecked();
    expect(screen.getByLabelText('Font size:')).toHaveValue(20);
    expect(screen.getByLabelText('List spacing:')).toHaveValue(4);
  });

  it('updates and persists every setting', async () => {
    open();
    await userEvent.click(screen.getByRole('checkbox'));
    expect(ctx.openLinkInNewTab).toBe(true);
    await userEvent.click(screen.getByLabelText('Black (AMOLED)'));
    expect(ctx.theme).toBe('amoledblack');
    expect(screen.getByLabelText('Black (AMOLED)')).toBeChecked();
    const font = screen.getByLabelText('Font size:');
    await userEvent.clear(font);
    await userEvent.type(font, '22');
    const spacing = screen.getByLabelText('List spacing:');
    await userEvent.clear(spacing);
    await userEvent.type(spacing, '12');
    expect(ctx).toMatchObject({ titleFontSize: '22', listSpacing: '12' });
    expect([localStorage.getItem('openLinkInNewTab'), localStorage.getItem('theme'), localStorage.getItem('titleFontSize'), localStorage.getItem('listSpacing')]).toEqual(['true', 'amoledblack', '22', '12']);
  });

  it('closes with ×', async () => {
    const { container } = open();
    await userEvent.click(screen.getByText('×'));
    expect(ctx.showSettings).toBe(false);
    expect(container.querySelector('.popup')).toBeNull();
  });
});
