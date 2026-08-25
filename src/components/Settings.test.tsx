import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { SettingsProvider, useSettings } from '../context/SettingsContext';
import Settings from './Settings';

function Harness() {
    const { settings } = useSettings();

    return (
        <>
            <span data-testid="show-settings">{String(settings.showSettings)}</span>
            <Settings />
        </>
    );
}

function renderSettings() {
    return render(
        <SettingsProvider>
            <Harness />
        </SettingsProvider>
    );
}

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe('Settings', () => {
    it('checks the radio of the active theme and persists a new one', () => {
        renderSettings();

        expect((screen.getByRole('radio', { name: 'Default' }) as HTMLInputElement).checked).toBe(true);

        fireEvent.click(screen.getByRole('radio', { name: 'Black (AMOLED)' }));

        expect((screen.getByRole('radio', { name: 'Black (AMOLED)' }) as HTMLInputElement).checked).toBe(true);
        expect(localStorage.getItem('theme')).toBe('amoledblack');
    });

    it('toggles opening links in a new tab', () => {
        renderSettings();
        const checkbox = screen.getByRole('checkbox') as HTMLInputElement;

        expect(checkbox.checked).toBe(false);
        fireEvent.click(checkbox);

        expect(checkbox.checked).toBe(true);
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    });

    it('updates the font size and list spacing', () => {
        renderSettings();

        fireEvent.change(screen.getByLabelText(/Font size/), { target: { value: '20' } });
        fireEvent.change(screen.getByLabelText(/List spacing/), { target: { value: '6' } });

        expect(localStorage.getItem('titleFontSize')).toBe('20');
        expect(localStorage.getItem('listSpacing')).toBe('6');
    });

    it('flips showSettings through the context when closed', () => {
        renderSettings();

        fireEvent.click(screen.getByText('×'));

        expect(screen.getByTestId('show-settings').textContent).toBe('true');
    });
});
