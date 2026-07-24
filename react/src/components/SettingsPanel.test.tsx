// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SettingsProvider } from '../context/SettingsContext';
import SettingsPanel from './SettingsPanel';

function mockMatchMedia() {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
    }));
}

function renderPanel() {
    return render(
        <SettingsProvider>
            <SettingsPanel />
        </SettingsProvider>,
    );
}

describe('SettingsPanel', () => {
    beforeEach(() => {
        localStorage.clear();
        mockMatchMedia();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders the settings popup with all controls', () => {
        renderPanel();
        expect(screen.getByRole('heading', { name: 'Settings' })).toBeTruthy();
        expect(screen.getByRole('checkbox')).toBeTruthy();
        expect(screen.getByRole('radio', { name: 'Default' })).toBeTruthy();
        expect(screen.getByRole('radio', { name: 'Night' })).toBeTruthy();
        expect(screen.getByRole('radio', { name: 'Black (AMOLED)' })).toBeTruthy();
        expect(screen.getByLabelText(/Font size:/)).toBeTruthy();
        expect(screen.getByLabelText(/List spacing:/)).toBeTruthy();
    });

    it('toggles open links in a new tab', () => {
        renderPanel();
        const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
        expect(checkbox.checked).toBe(false);
        fireEvent.click(checkbox);
        expect(checkbox.checked).toBe(true);
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    });

    it('selects a theme via the radio group', () => {
        renderPanel();
        const night = screen.getByRole('radio', { name: 'Night' }) as HTMLInputElement;
        fireEvent.click(night);
        expect(night.checked).toBe(true);
        expect(localStorage.getItem('theme')).toBe('night');
    });

    it('changes font size and list spacing', () => {
        renderPanel();
        const fontInput = screen.getByLabelText(/Font size:/) as HTMLInputElement;
        fireEvent.change(fontInput, { target: { value: '20' } });
        expect(fontInput.value).toBe('20');
        expect(localStorage.getItem('titleFontSize')).toBe('20');

        const spacingInput = screen.getByLabelText(/List spacing:/) as HTMLInputElement;
        fireEvent.change(spacingInput, { target: { value: '4' } });
        expect(spacingInput.value).toBe('4');
        expect(localStorage.getItem('listSpacing')).toBe('4');
    });

    it('calls toggleSettings when the close button is clicked', () => {
        const { container } = renderPanel();
        const close = container.querySelector('.close') as HTMLElement;
        expect(close).toBeTruthy();
        fireEvent.click(close);
    });
});
