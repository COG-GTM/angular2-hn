import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { SettingsProvider, useSettings } from '../context/SettingsContext';

function TestComponent() {
    const { settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing } = useSettings();
    return (
        <div>
            <span data-testid="theme">{settings.theme}</span>
            <span data-testid="showSettings">{String(settings.showSettings)}</span>
            <span data-testid="openLinkInNewTab">{String(settings.openLinkInNewTab)}</span>
            <span data-testid="titleFontSize">{settings.titleFontSize}</span>
            <span data-testid="listSpacing">{settings.listSpacing}</span>
            <button onClick={toggleSettings}>Toggle Settings</button>
            <button onClick={toggleOpenLinksInNewTab}>Toggle New Tab</button>
            <button onClick={() => setTheme('night')}>Night Theme</button>
            <button onClick={() => setFont('20')}>Set Font 20</button>
            <button onClick={() => setSpacing('10')}>Set Spacing 10</button>
        </div>
    );
}

beforeEach(() => {
    localStorage.clear();
});

describe('SettingsContext', () => {
    it('provides default settings', () => {
        render(
            <SettingsProvider>
                <TestComponent />
            </SettingsProvider>
        );
        expect(screen.getByTestId('showSettings')).toHaveTextContent('false');
        expect(screen.getByTestId('openLinkInNewTab')).toHaveTextContent('false');
        expect(screen.getByTestId('titleFontSize')).toHaveTextContent('16');
        expect(screen.getByTestId('listSpacing')).toHaveTextContent('0');
    });

    it('toggles settings visibility', () => {
        render(
            <SettingsProvider>
                <TestComponent />
            </SettingsProvider>
        );
        fireEvent.click(screen.getByText('Toggle Settings'));
        expect(screen.getByTestId('showSettings')).toHaveTextContent('true');
    });

    it('toggles open links in new tab', () => {
        render(
            <SettingsProvider>
                <TestComponent />
            </SettingsProvider>
        );
        fireEvent.click(screen.getByText('Toggle New Tab'));
        expect(screen.getByTestId('openLinkInNewTab')).toHaveTextContent('true');
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    });

    it('sets theme', () => {
        render(
            <SettingsProvider>
                <TestComponent />
            </SettingsProvider>
        );
        fireEvent.click(screen.getByText('Night Theme'));
        expect(screen.getByTestId('theme')).toHaveTextContent('night');
        expect(localStorage.getItem('theme')).toBe('night');
    });

    it('sets font size', () => {
        render(
            <SettingsProvider>
                <TestComponent />
            </SettingsProvider>
        );
        fireEvent.click(screen.getByText('Set Font 20'));
        expect(screen.getByTestId('titleFontSize')).toHaveTextContent('20');
        expect(localStorage.getItem('titleFontSize')).toBe('20');
    });

    it('sets list spacing', () => {
        render(
            <SettingsProvider>
                <TestComponent />
            </SettingsProvider>
        );
        fireEvent.click(screen.getByText('Set Spacing 10'));
        expect(screen.getByTestId('listSpacing')).toHaveTextContent('10');
        expect(localStorage.getItem('listSpacing')).toBe('10');
    });
});
