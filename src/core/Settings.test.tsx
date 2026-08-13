import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { SettingsProvider } from '../context/SettingsContext';
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
    });

    it('persists the selected theme', () => {
        renderSettings();

        fireEvent.click(screen.getByLabelText('Black (AMOLED)'));

        expect(screen.getByLabelText<HTMLInputElement>('Black (AMOLED)').checked).toBe(true);
        expect(localStorage.getItem('theme')).toBe('amoledblack');
    });

    it('persists font size and list spacing', () => {
        renderSettings();

        fireEvent.change(screen.getByLabelText(/Font size:/), { target: { value: '20' } });
        fireEvent.change(screen.getByLabelText(/List spacing:/), { target: { value: '5' } });

        expect(localStorage.getItem('titleFontSize')).toBe('20');
        expect(localStorage.getItem('listSpacing')).toBe('5');
    });

    it('persists the open links in a new tab preference', () => {
        renderSettings();

        fireEvent.click(screen.getByLabelText('Open links in a new tab'));

        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    });
});
