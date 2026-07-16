import { fireEvent, render, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { Settings } from './Settings';
import { SettingsProvider } from '../../context/SettingsContext';

function renderSettings() {
    const wrapper = ({ children }: { children: ReactNode }) => <SettingsProvider>{children}</SettingsProvider>;
    return render(<Settings />, { wrapper });
}

describe('Settings', () => {
    it('toggles open-links-in-new-tab and persists it', () => {
        renderSettings();
        const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
        expect(checkbox.checked).toBe(false);

        fireEvent.click(checkbox);
        expect(checkbox.checked).toBe(true);
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    });

    it('selects each theme via its radio and persists it', () => {
        renderSettings();
        fireEvent.click(screen.getByRole('radio', { name: 'Night' }));
        expect((screen.getByRole('radio', { name: 'Night' }) as HTMLInputElement).checked).toBe(true);
        expect(localStorage.getItem('theme')).toBe('night');

        fireEvent.click(screen.getByRole('radio', { name: 'Black (AMOLED)' }));
        expect((screen.getByRole('radio', { name: 'Black (AMOLED)' }) as HTMLInputElement).checked).toBe(true);
        expect(localStorage.getItem('theme')).toBe('amoledblack');

        fireEvent.click(screen.getByRole('radio', { name: 'Default' }));
        expect((screen.getByRole('radio', { name: 'Default' }) as HTMLInputElement).checked).toBe(true);
        expect(localStorage.getItem('theme')).toBe('default');
    });

    it('updates the font size and persists it', () => {
        renderSettings();
        const fontInput = screen.getByRole('spinbutton', { name: /Font size/ }) as HTMLInputElement;
        fireEvent.change(fontInput, { target: { value: '22' } });
        expect(fontInput.value).toBe('22');
        expect(localStorage.getItem('titleFontSize')).toBe('22');
    });

    it('updates the list spacing and persists it', () => {
        renderSettings();
        const spacingInput = screen.getByRole('spinbutton', { name: /List spacing/ }) as HTMLInputElement;
        fireEvent.change(spacingInput, { target: { value: '9' } });
        expect(spacingInput.value).toBe('9');
        expect(localStorage.getItem('listSpacing')).toBe('9');
    });
});
