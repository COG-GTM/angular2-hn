import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SettingsProvider } from '../../context/SettingsContext';
import Settings from './Settings';

function renderSettings() {
    return render(
        <SettingsProvider>
            <Settings />
        </SettingsProvider>
    );
}

describe('Settings', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.stubGlobal(
            'matchMedia',
            vi.fn(() => ({
                matches: false,
                media: '(prefers-color-scheme: dark)',
                onchange: null,
                addEventListener: () => {},
                removeEventListener: () => {},
                addListener: () => {},
                removeListener: () => {},
                dispatchEvent: () => true,
            }))
        );
    });

    it('toggles opening links in a new tab', () => {
        renderSettings();

        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).not.toBeChecked();

        fireEvent.click(checkbox);

        expect(checkbox).toBeChecked();
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    });

    it('selects a theme', () => {
        renderSettings();

        fireEvent.click(screen.getByLabelText('Night'));

        expect(screen.getByLabelText('Night')).toBeChecked();
        expect(localStorage.getItem('theme')).toBe('night');
    });

    it('updates the font size and list spacing', () => {
        renderSettings();

        fireEvent.change(screen.getByLabelText(/Font size:/), { target: { value: '20' } });
        fireEvent.change(screen.getByLabelText(/List spacing:/), { target: { value: '5' } });

        expect(localStorage.getItem('titleFontSize')).toBe('20');
        expect(localStorage.getItem('listSpacing')).toBe('5');
    });
});
