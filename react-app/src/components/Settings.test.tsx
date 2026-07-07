import { beforeEach, describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Settings from './Settings';
import { renderWithProviders } from '../test/test-utils';

describe('Settings', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('selects a theme and persists it', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Settings />);

    const night = screen.getByLabelText('Night') as HTMLInputElement;
    expect(night.checked).toBe(false);

    await user.click(night);
    expect(night.checked).toBe(true);
    expect(localStorage.getItem('theme')).toBe('night');

    const amoled = screen.getByLabelText('Black (AMOLED)') as HTMLInputElement;
    await user.click(amoled);
    expect(amoled.checked).toBe(true);
    expect(localStorage.getItem('theme')).toBe('amoledblack');
  });

  it('toggles open-links-in-new-tab and persists it', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Settings />);

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
    await user.click(checkbox);
    expect(checkbox.checked).toBe(true);
    expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
  });

  it('changes the title font size and list spacing', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Settings />);

    const font = screen.getByLabelText(/Font size/) as HTMLInputElement;
    await user.clear(font);
    await user.type(font, '20');
    expect(localStorage.getItem('titleFontSize')).toBe('20');

    const spacing = screen.getByLabelText(/List spacing/) as HTMLInputElement;
    await user.clear(spacing);
    await user.type(spacing, '5');
    expect(localStorage.getItem('listSpacing')).toBe('5');
  });
});
