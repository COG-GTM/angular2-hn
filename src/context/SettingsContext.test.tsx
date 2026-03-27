import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsProvider } from './SettingsContext';
import { useSettings } from '../hooks/useSettings';

function TestConsumer() {
    const { settings, toggleOpenLinksInNewTab, setTheme } = useSettings();
    return (
        <div>
            <span data-testid="theme">{settings.theme}</span>
            <span data-testid="openLinks">{String(settings.openLinkInNewTab)}</span>
            <button onClick={toggleOpenLinksInNewTab}>Toggle Links</button>
            <button onClick={() => setTheme('night')}>Set Night</button>
        </div>
    );
}

describe('SettingsContext', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('provides default settings', () => {
        render(
            <SettingsProvider>
                <TestConsumer />
            </SettingsProvider>
        );
        expect(screen.getByTestId('theme').textContent).toBe('default');
            expect(screen.getByTestId('openLinks').textContent).toBe('false');
        });

        it('toggles open links in new tab', async () => {
            render(
                <SettingsProvider>
                    <TestConsumer />
                </SettingsProvider>
            );
            const button = screen.getByText('Toggle Links');
            await act(async () => {
                await userEvent.click(button);
            });
            expect(screen.getByTestId('openLinks').textContent).toBe('true');
    });

    it('changes theme', async () => {
        render(
            <SettingsProvider>
                <TestConsumer />
            </SettingsProvider>
        );
        const button = screen.getByText('Set Night');
        await act(async () => {
            await userEvent.click(button);
        });
        expect(screen.getByTestId('theme').textContent).toBe('night');
    });
});
