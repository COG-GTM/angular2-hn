import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../test/renderWithProviders';
import Header from './Header';
import Settings from './Settings';

async function openSettings() {
  renderWithProviders(<Header />);
  await userEvent.click(screen.getByAltText('Settings'));
}

describe('Settings', () => {
  it('renders the Angular controls with the current settings', () => {
    localStorage.setItem('theme', 'night');
    localStorage.setItem('titleFontSize', '20');
    localStorage.setItem('listSpacing', '4');
    renderWithProviders(<Settings />);
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).not.toBeChecked();
    expect(screen.getByLabelText('Night')).toBeChecked();
    expect(screen.getByLabelText('Default')).not.toBeChecked();
    expect(screen.getByLabelText('Black (AMOLED)')).not.toBeChecked();
    expect(screen.getByLabelText('Font size:')).toHaveValue(20);
    expect(screen.getByLabelText('List spacing:')).toHaveValue(4);
  });

  it.each([
    ['Night', 'night'],
    ['Black (AMOLED)', 'amoledblack'],
    ['Default', 'default'],
  ])('selecting %s sets and persists the theme', async (label, theme) => {
    localStorage.setItem('theme', label === 'Default' ? 'night' : 'default');
    renderWithProviders(<Settings />);
    await userEvent.click(screen.getByLabelText(label));
    expect(screen.getByLabelText(label)).toBeChecked();
    expect(localStorage.getItem('theme')).toBe(theme);
  });

  it('toggles open links in a new tab', async () => {
    renderWithProviders(<Settings />);
    await userEvent.click(screen.getByRole('checkbox'));
    expect(screen.getByRole('checkbox')).toBeChecked();
    expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    await userEvent.click(screen.getByRole('checkbox'));
    expect(localStorage.getItem('openLinkInNewTab')).toBe('false');
  });

  it('changes the title font size and list spacing', () => {
    renderWithProviders(<Settings />);
    fireEvent.change(screen.getByLabelText('Font size:'), { target: { value: '22' } });
    fireEvent.change(screen.getByLabelText('List spacing:'), { target: { value: '7' } });
    expect(screen.getByLabelText('Font size:')).toHaveValue(22);
    expect(screen.getByLabelText('List spacing:')).toHaveValue(7);
    expect(localStorage.getItem('titleFontSize')).toBe('22');
    expect(localStorage.getItem('listSpacing')).toBe('7');
  });

  it('closes with the × button', async () => {
    await openSettings();
    await userEvent.click(screen.getByText('×'));
    expect(screen.queryByRole('heading', { name: 'Settings' })).not.toBeInTheDocument();
  });
});
