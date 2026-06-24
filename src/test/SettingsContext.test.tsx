import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SettingsProvider, useSettings } from '../context/SettingsContext';

function TestConsumer() {
    const { settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing } = useSettings();
    return (
        <div>
            <span data-testid="theme">{settings.theme}</span>
            <span data-testid="showSettings">{String(settings.showSettings)}</span>
            <span data-testid="openLinkInNewTab">{String(settings.openLinkInNewTab)}</span>
            <span data-testid="titleFontSize">{settings.titleFontSize}</span>
            <span data-testid="listSpacing">{settings.listSpacing}</span>
            <button onClick={toggleSettings}>toggle</button>
            <button onClick={toggleOpenLinksInNewTab}>toggleTab</button>
            <button onClick={() => setTheme('night')}>night</button>
            <button onClick={() => setFont('20')}>font20</button>
            <button onClick={() => setSpacing('5')}>spacing5</button>
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
                <TestConsumer />
            </SettingsProvider>
        );
        expect(screen.getByTestId('theme').textContent).toBe('default');
        expect(screen.getByTestId('showSettings').textContent).toBe('false');
        expect(screen.getByTestId('titleFontSize').textContent).toBe('16');
        expect(screen.getByTestId('listSpacing').textContent).toBe('0');
    });

    it('toggleSettings flips showSettings', () => {
        render(
            <SettingsProvider>
                <TestConsumer />
            </SettingsProvider>
        );
        fireEvent.click(screen.getByText('toggle'));
        expect(screen.getByTestId('showSettings').textContent).toBe('true');
    });

    it('setTheme updates theme and persists', () => {
        render(
            <SettingsProvider>
                <TestConsumer />
            </SettingsProvider>
        );
        fireEvent.click(screen.getByText('night'));
        expect(screen.getByTestId('theme').textContent).toBe('night');
        expect(localStorage.getItem('theme')).toBe('night');
    });

    it('toggleOpenLinksInNewTab persists', () => {
        render(
            <SettingsProvider>
                <TestConsumer />
            </SettingsProvider>
        );
        fireEvent.click(screen.getByText('toggleTab'));
        expect(screen.getByTestId('openLinkInNewTab').textContent).toBe('true');
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    });

    it('setFont and setSpacing persist', () => {
        render(
            <SettingsProvider>
                <TestConsumer />
            </SettingsProvider>
        );
        fireEvent.click(screen.getByText('font20'));
        fireEvent.click(screen.getByText('spacing5'));
        expect(screen.getByTestId('titleFontSize').textContent).toBe('20');
        expect(screen.getByTestId('listSpacing').textContent).toBe('5');
        expect(localStorage.getItem('titleFontSize')).toBe('20');
        expect(localStorage.getItem('listSpacing')).toBe('5');
    });

    it('loads saved theme from localStorage', () => {
        localStorage.setItem('theme', 'amoledblack');
        render(
            <SettingsProvider>
                <TestConsumer />
            </SettingsProvider>
        );
        expect(screen.getByTestId('theme').textContent).toBe('amoledblack');
    });
});
