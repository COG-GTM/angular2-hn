import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SettingsProvider, useSettings } from '../SettingsContext'

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})


const TestComponent = () => {
  const { settings, toggleSettings, setTheme, setFont, setSpacing } = useSettings()
  
  return (
    <div>
      <div data-testid="theme">{settings.theme}</div>
      <div data-testid="font-size">{settings.titleFontSize}</div>
      <div data-testid="spacing">{settings.listSpacing}</div>
      <div data-testid="show-settings">{settings.showSettings.toString()}</div>
      <button onClick={toggleSettings}>Toggle Settings</button>
      <button onClick={() => setTheme('night')}>Set Night Theme</button>
      <button onClick={() => setFont('18')}>Set Font 18</button>
      <button onClick={() => setSpacing('10')}>Set Spacing 10</button>
    </div>
  )
}

describe('SettingsContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  it('provides default settings values', () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    )

    expect(screen.getByTestId('theme')).toHaveTextContent('default')
    expect(screen.getByTestId('font-size')).toHaveTextContent('16')
    expect(screen.getByTestId('spacing')).toHaveTextContent('0')
    expect(screen.getByTestId('show-settings')).toHaveTextContent('false')
  })

  it('toggles settings visibility', () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    )

    const toggleButton = screen.getByText('Toggle Settings')
    fireEvent.click(toggleButton)
    
    expect(screen.getByTestId('show-settings')).toHaveTextContent('true')
  })

  it('updates theme and saves to localStorage', () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    )

    const themeButton = screen.getByText('Set Night Theme')
    fireEvent.click(themeButton)
    
    expect(screen.getByTestId('theme')).toHaveTextContent('night')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'night')
  })

  it('updates font size and saves to localStorage', () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    )

    const fontButton = screen.getByText('Set Font 18')
    fireEvent.click(fontButton)
    
    expect(screen.getByTestId('font-size')).toHaveTextContent('18')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('titleFontSize', '18')
  })

  it('updates spacing and saves to localStorage', () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    )

    const spacingButton = screen.getByText('Set Spacing 10')
    fireEvent.click(spacingButton)
    
    expect(screen.getByTestId('spacing')).toHaveTextContent('10')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('listSpacing', '10')
  })
})
