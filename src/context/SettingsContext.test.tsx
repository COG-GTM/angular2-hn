import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SettingsProvider, useSettings } from './SettingsContext'

function TestConsumer() {
    const { settings, setTheme, toggleOpenLinksInNewTab, setFont, setSpacing } = useSettings()
    return (
        <div>
            <span data-testid="theme">{settings.theme}</span>
            <span data-testid="newTab">{String(settings.openLinkInNewTab)}</span>
            <span data-testid="fontSize">{settings.titleFontSize}</span>
            <span data-testid="spacing">{settings.listSpacing}</span>
            <button onClick={() => setTheme('night')}>Set Night</button>
            <button onClick={toggleOpenLinksInNewTab}>Toggle Tab</button>
            <button onClick={() => setFont('20')}>Set Font 20</button>
            <button onClick={() => setSpacing('5')}>Set Spacing 5</button>
        </div>
    )
}

describe('SettingsContext', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it('provides default settings', () => {
        render(
            <SettingsProvider>
                <TestConsumer />
            </SettingsProvider>
        )
        expect(screen.getByTestId('fontSize').textContent).toBe('16')
        expect(screen.getByTestId('spacing').textContent).toBe('0')
        expect(screen.getByTestId('newTab').textContent).toBe('false')
    })

    it('can set theme', async () => {
        const user = userEvent.setup()
        render(
            <SettingsProvider>
                <TestConsumer />
            </SettingsProvider>
        )
        await user.click(screen.getByText('Set Night'))
        expect(screen.getByTestId('theme').textContent).toBe('night')
        expect(localStorage.getItem('theme')).toBe('night')
    })

    it('can toggle open links in new tab', async () => {
        const user = userEvent.setup()
        render(
            <SettingsProvider>
                <TestConsumer />
            </SettingsProvider>
        )
        await user.click(screen.getByText('Toggle Tab'))
        expect(screen.getByTestId('newTab').textContent).toBe('true')
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true')
    })

    it('can set font size', async () => {
        const user = userEvent.setup()
        render(
            <SettingsProvider>
                <TestConsumer />
            </SettingsProvider>
        )
        await user.click(screen.getByText('Set Font 20'))
        expect(screen.getByTestId('fontSize').textContent).toBe('20')
        expect(localStorage.getItem('titleFontSize')).toBe('20')
    })

    it('can set spacing', async () => {
        const user = userEvent.setup()
        render(
            <SettingsProvider>
                <TestConsumer />
            </SettingsProvider>
        )
        await user.click(screen.getByText('Set Spacing 5'))
        expect(screen.getByTestId('spacing').textContent).toBe('5')
        expect(localStorage.getItem('listSpacing')).toBe('5')
    })

    it('throws when used outside provider', () => {
        expect(() => render(<TestConsumer />)).toThrow('useSettings must be used within a SettingsProvider')
    })
})
