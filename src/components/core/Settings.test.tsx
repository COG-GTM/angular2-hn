import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { SettingsProvider } from '../../context/SettingsContext';
import Settings from './Settings';

beforeEach(() => {
    localStorage.clear();
});

describe('Settings', () => {
    it('persists the selected theme', async () => {
        render(
            <SettingsProvider>
                <Settings />
            </SettingsProvider>
        );

        await userEvent.click(screen.getByLabelText('Night'));

        expect(screen.getByLabelText<HTMLInputElement>('Night').checked).toBe(true);
        expect(localStorage.getItem('theme')).toBe('night');
    });

    it('persists the open links in a new tab preference', async () => {
        render(
            <SettingsProvider>
                <Settings />
            </SettingsProvider>
        );

        await userEvent.click(screen.getByRole('checkbox'));

        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    });
});
