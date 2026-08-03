import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SettingsProvider } from './SettingsProvider';
import { useSettings, useSettingsStore } from './useSettings';

function SettingsConsumer() {
    const settings = useSettings();
    const store = useSettingsStore();

    return (
        <div>
            <span data-testid="theme">{settings.theme}</span>
            <span data-testid="show-settings">{String(settings.showSettings)}</span>
            <button onClick={() => store.toggleSettings()}>toggle</button>
            <button onClick={() => store.setTheme('night')}>night</button>
        </div>
    );
}

describe('useSettings', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('re-renders consumers when the store changes', async () => {
        render(
            <SettingsProvider>
                <SettingsConsumer />
            </SettingsProvider>
        );

        expect(screen.getByTestId('theme')).toHaveTextContent('default');
        expect(screen.getByTestId('show-settings')).toHaveTextContent('false');

        await userEvent.click(screen.getByRole('button', { name: 'toggle' }));
        expect(screen.getByTestId('show-settings')).toHaveTextContent('true');

        await userEvent.click(screen.getByRole('button', { name: 'night' }));
        expect(screen.getByTestId('theme')).toHaveTextContent('night');
    });

    it('throws when used outside of a provider', () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});

        expect(() => render(<SettingsConsumer />)).toThrow('useSettings must be used within a SettingsProvider');

        vi.mocked(console.error).mockRestore();
    });
});
