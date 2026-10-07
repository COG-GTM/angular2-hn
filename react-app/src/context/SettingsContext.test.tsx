import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { SettingsProvider } from './SettingsContext'
import { useSettings } from '../hooks/useSettings'

function SettingsProbe() {
  const settings = useSettings()
  return (
    <div>
      <span data-testid="theme">{settings.theme}</span>
      <span data-testid="font">{settings.titleFontSize}</span>
      <span data-testid="spacing">{settings.listSpacing}</span>
      <span data-testid="new-tab">{String(settings.openLinkInNewTab)}</span>
      <button onClick={settings.toggleOpenLinksInNewTab}>Toggle links</button>
      <button onClick={() => settings.setFont('20')}>Set font</button>
      <button onClick={() => settings.setSpacing('8')}>Set spacing</button>
      <button onClick={() => settings.setTheme('amoledblack')}>Set theme</button>
    </div>
  )
}

function renderSettings() {
  return render(
    <SettingsProvider>
      <SettingsProbe />
    </SettingsProvider>,
  )
}

describe('SettingsContext', () => {
  beforeEach(() => {
    localStorage.clear()
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    })
  })

  it('uses defaults and persists theme initialization', () => {
    renderSettings()
    expect(screen.getByTestId('theme')).toHaveTextContent('default')
    expect(screen.getByTestId('font')).toHaveTextContent('16')
    expect(screen.getByTestId('spacing')).toHaveTextContent('0')
    expect(screen.getByTestId('new-tab')).toHaveTextContent('false')
    expect(localStorage.getItem('theme')).toBe('default')
  })

  it('persists control changes using the Angular storage keys', () => {
    renderSettings()
    fireEvent.click(screen.getByText('Toggle links'))
    fireEvent.click(screen.getByText('Set font'))
    fireEvent.click(screen.getByText('Set spacing'))
    fireEvent.click(screen.getByText('Set theme'))
    expect(localStorage.getItem('openLinkInNewTab')).toBe('true')
    expect(localStorage.getItem('titleFontSize')).toBe('20')
    expect(localStorage.getItem('listSpacing')).toBe('8')
    expect(localStorage.getItem('theme')).toBe('amoledblack')
  })

  it('uses a saved theme instead of the system preference', () => {
    localStorage.setItem('theme', 'amoledblack')
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    })
    renderSettings()
    expect(screen.getByTestId('theme')).toHaveTextContent('amoledblack')
  })

  it('initializes from system dark mode and responds to later changes', () => {
    let changeListener: ((event: MediaQueryListEvent) => void) | undefined
    const removeEventListener = vi.fn()
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockReturnValue({
        matches: true,
        addEventListener: vi.fn((_type: string, listener: (event: MediaQueryListEvent) => void) => {
          changeListener = listener
        }),
        removeEventListener,
      }),
    })
    const view = renderSettings()
    expect(screen.getByTestId('theme')).toHaveTextContent('night')
    expect(localStorage.getItem('theme')).toBe('night')

    act(() => changeListener?.({ matches: false } as MediaQueryListEvent))
    expect(screen.getByTestId('theme')).toHaveTextContent('default')
    expect(localStorage.getItem('theme')).toBe('default')
    view.unmount()
    expect(removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })
})
