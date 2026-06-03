import { beforeAll, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { SettingsPanel } from './SettingsPanel';
import { SettingsProvider } from '../context/SettingsContext';

beforeAll(() => {
    vi.stubGlobal(
        'matchMedia',
        vi.fn().mockImplementation((query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            addListener: vi.fn(),
            removeListener: vi.fn(),
            dispatchEvent: vi.fn(),
        }))
    );
});

function renderPanel() {
    return render(
        <SettingsProvider>
            <SettingsPanel />
        </SettingsProvider>
    );
}

describe('SettingsPanel', () => {
    it('renders the three theme radios', () => {
        renderPanel();
        expect(screen.getByLabelText('Default')).toBeInTheDocument();
        expect(screen.getByLabelText('Night')).toBeInTheDocument();
        expect(screen.getByLabelText('Black (AMOLED)')).toBeInTheDocument();
    });

    it('toggles the "open links in a new tab" checkbox', () => {
        renderPanel();
        const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
        expect(checkbox.checked).toBe(false);
        fireEvent.click(checkbox);
        expect(checkbox.checked).toBe(true);
    });
});
