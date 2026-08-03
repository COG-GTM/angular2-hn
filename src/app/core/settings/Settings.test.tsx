import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '../../../test/renderWithProviders';
import { Settings } from './Settings';

describe('Settings', () => {
  it('offers the three themes with the stored one selected', () => {
    localStorage.setItem('theme', 'night');
    renderWithProviders(<Settings />);

    expect(screen.getByRole('radio', { name: 'Default' })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: 'Night' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Black (AMOLED)' })).not.toBeChecked();
  });

  it('persists a selected theme', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Settings />);

    await user.click(screen.getByRole('radio', { name: 'Black (AMOLED)' }));

    expect(screen.getByRole('radio', { name: 'Black (AMOLED)' })).toBeChecked();
    expect(localStorage.getItem('theme')).toBe('amoledblack');
  });

  it('persists the new tab preference', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Settings />);

    await user.click(screen.getByRole('checkbox'));

    expect(screen.getByRole('checkbox')).toBeChecked();
    expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
  });

  it('persists the font size and list spacing', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Settings />);

    const fontSize = screen.getByLabelText(/Font size/);
    await user.clear(fontSize);
    await user.type(fontSize, '24');

    const listSpacing = screen.getByLabelText(/List spacing/);
    await user.clear(listSpacing);
    await user.type(listSpacing, '8');

    expect(localStorage.getItem('titleFontSize')).toBe('24');
    expect(localStorage.getItem('listSpacing')).toBe('8');
  });
});
