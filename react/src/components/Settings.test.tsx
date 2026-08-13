import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, beforeEach } from 'vitest';

import { SettingsProvider } from '../context/SettingsContext';
import { Settings } from './Settings';

function renderSettings() {
  return render(
    <MemoryRouter>
      <SettingsProvider>
        <Settings />
      </SettingsProvider>
    </MemoryRouter>
  );
}

describe('Settings', () => {
  beforeEach(() => {
    localStorage.clear();
    window.matchMedia = (query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList;
  });

  it('toggles the selected theme', async () => {
    const user = userEvent.setup();
    renderSettings();

    const night = screen.getByLabelText('Night') as HTMLInputElement;
    expect(night.checked).toBe(false);

    await user.click(night);

    expect(night.checked).toBe(true);
    expect((screen.getByLabelText('Default') as HTMLInputElement).checked).toBe(false);
    expect(localStorage.getItem('theme')).toBe('night');
  });
});
