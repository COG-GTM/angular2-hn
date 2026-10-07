import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { SettingsProvider } from '../context/SettingsContext'
import { useSettings } from '../hooks/useSettings'
import Header from './Header'
import { render } from '@testing-library/react'

function HeaderWithTheme() {
  const settings = useSettings()
  return (
    <div className={settings.theme} data-testid="theme-root">
      <Header />
    </div>
  )
}

describe('Header', () => {
  it('opens settings and applies a selected theme', async () => {
    const user = userEvent.setup()
    render(
      <SettingsProvider>
        <MemoryRouter>
          <HeaderWithTheme />
        </MemoryRouter>
      </SettingsProvider>,
    )

    await user.click(screen.getByAltText('Settings'))
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument()
    await user.click(screen.getByLabelText('Night'))
    expect(screen.getByTestId('theme-root')).toHaveClass('night')
    expect(localStorage.getItem('theme')).toBe('night')
  })
})
