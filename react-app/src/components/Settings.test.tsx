import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useSettings } from '../context/SettingsContext';
import { renderWithProviders } from '../test';
import { Settings } from './Settings';

function SettingsProbe() {
    const { settings } = useSettings();
    return <pre data-testid="settings-state">{JSON.stringify(settings)}</pre>;
}

function renderSettings() {
    const result = renderWithProviders(
        <>
            <Settings />
            <SettingsProbe />
        </>
    );
    const state = () => JSON.parse(screen.getByTestId('settings-state').textContent ?? '{}');
    return { ...result, state };
}

describe('Settings', () => {
    it('renders the Angular popup structure', () => {
        const { container } = renderSettings();
        const overlay = container.querySelector('#popup1.overlay');
        const dialog = screen.getByRole('dialog', { name: 'Settings' });
        expect(dialog).toHaveClass('popup');
        expect(dialog).toHaveAttribute('aria-modal', 'true');
        expect(overlay).toContainElement(dialog);
        expect(screen.getByRole('heading', { name: 'Links' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Select a theme' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Change Font' })).toBeInTheDocument();
        expect(container.querySelectorAll('.control-section')).toHaveLength(3);
        const close = screen.getByRole('button', { name: 'Close settings' });
        expect(close.tagName).toBe('SPAN');
        expect(close).toHaveClass('close');
        expect(close).toHaveTextContent('×');
        expect(screen.getAllByRole('radio').map((radio) => (radio as HTMLInputElement).value)).toEqual([
            'default',
            'night',
            'amoledblack',
        ]);
    });

    it('shows the current settings from localStorage', () => {
        window.localStorage.setItem('theme', 'night');
        window.localStorage.setItem('openLinkInNewTab', 'true');
        window.localStorage.setItem('titleFontSize', '22');
        window.localStorage.setItem('listSpacing', '7');
        renderSettings();
        expect(screen.getByRole('radio', { name: 'Night' })).toBeChecked();
        expect(screen.getByRole('radio', { name: 'Default' })).not.toBeChecked();
        expect(screen.getByRole('checkbox', { name: 'Open links in a new tab' })).toBeChecked();
        expect(screen.getByRole('spinbutton', { name: 'Font size:' })).toHaveValue(22);
        expect(screen.getByRole('spinbutton', { name: 'List spacing:' })).toHaveValue(7);
    });

    it.each([
        ['Night', 'night'],
        ['Black (AMOLED)', 'amoledblack'],
        ['Default', 'default'],
    ])('selecting %s sets and persists the theme', async (label, theme) => {
        window.localStorage.setItem('theme', theme === 'default' ? 'night' : 'default');
        const { user, state } = renderSettings();
        await user.click(screen.getByRole('radio', { name: label }));
        expect(screen.getByRole('radio', { name: label })).toBeChecked();
        expect(state().theme).toBe(theme);
        expect(window.localStorage.getItem('theme')).toBe(theme);
    });

    it('toggles open-links-in-new-tab and persists it', async () => {
        const { user, state } = renderSettings();
        const checkbox = screen.getByRole('checkbox', { name: 'Open links in a new tab' });
        expect(checkbox).not.toBeChecked();

        await user.click(checkbox);
        expect(checkbox).toBeChecked();
        expect(state().openLinkInNewTab).toBe(true);
        expect(window.localStorage.getItem('openLinkInNewTab')).toBe('true');

        await user.click(checkbox);
        expect(state().openLinkInNewTab).toBe(false);
        expect(window.localStorage.getItem('openLinkInNewTab')).toBe('false');
    });

    it('saves the title font size on change (typing and spinner/paste)', async () => {
        const { user, state } = renderSettings();
        const input = screen.getByRole('spinbutton', { name: 'Font size:' });
        expect(input).toHaveValue(16);
        expect(input).toHaveAttribute('min', '1');

        await user.clear(input);
        await user.type(input, '20');
        expect(state().titleFontSize).toBe('20');
        expect(window.localStorage.getItem('titleFontSize')).toBe('20');

        fireEvent.change(input, { target: { value: '21' } });
        expect(state().titleFontSize).toBe('21');
        expect(window.localStorage.getItem('titleFontSize')).toBe('21');
    });

    it('saves the list spacing on change', async () => {
        const { user, state } = renderSettings();
        const input = screen.getByRole('spinbutton', { name: 'List spacing:' });
        expect(input).toHaveValue(0);
        expect(input).toHaveAttribute('min', '0');

        await user.type(input, '5');
        expect(state().listSpacing).toBe('5');
        expect(window.localStorage.getItem('listSpacing')).toBe('5');

        fireEvent.change(input, { target: { value: '12' } });
        expect(state().listSpacing).toBe('12');
        expect(window.localStorage.getItem('listSpacing')).toBe('12');
    });

    it('close (×) calls toggleSettings and does not persist showSettings', async () => {
        const { user, state } = renderSettings();
        const before = state().showSettings;
        await user.click(screen.getByRole('button', { name: 'Close settings' }));
        expect(state().showSettings).toBe(!before);
        expect(window.localStorage.getItem('showSettings')).toBeNull();
    });

    it('focuses the dialog on open and traps Tab / Shift+Tab inside it', async () => {
        const { user } = renderSettings();
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveFocus();

        const close = screen.getByRole('button', { name: 'Close settings' });
        const spacing = screen.getByRole('spinbutton', { name: 'List spacing:' });

        await user.tab();
        expect(close).toHaveFocus();
        await user.tab();
        expect(screen.getByRole('checkbox', { name: 'Open links in a new tab' })).toHaveFocus();

        spacing.focus();
        await user.tab();
        expect(close).toHaveFocus();

        await user.tab({ shift: true });
        expect(spacing).toHaveFocus();

        dialog.focus();
        await user.tab({ shift: true });
        expect(spacing).toHaveFocus();
    });
});
