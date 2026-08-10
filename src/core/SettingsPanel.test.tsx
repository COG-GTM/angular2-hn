import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { SettingsProvider } from '../shared/settings/SettingsProvider';
import { SettingsPanel } from './SettingsPanel';

function renderPanel() {
    return render(
        <SettingsProvider>
            <SettingsPanel />
        </SettingsProvider>
    );
}

describe('SettingsPanel', () => {
    it('persists the selected theme', async () => {
        renderPanel();

        await userEvent.click(screen.getByRole('radio', { name: 'Night' }));

        expect(localStorage.getItem('theme')).toBe('night');
        expect(screen.getByRole('radio', { name: 'Night' })).toBeChecked();
    });

    it('persists the open-links-in-new-tab preference', async () => {
        renderPanel();

        await userEvent.click(screen.getByRole('checkbox'));

        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    });
});
