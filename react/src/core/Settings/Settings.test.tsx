// CHAR-33 parity test for src/app/core/settings/settings.component.{html,ts}: every control in the Angular
// template is bound to the same SettingsService method (useSettings action) and persists the same localStorage
// key/encoding as src/app/shared/services/settings.service.ts.
import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useSettings } from '../../settings'
import { renderWithProviders } from '../../test/renderWithProviders'
import { Settings } from './Settings'

function SettingsProbe() {
  const { settings } = useSettings()
  return <output data-testid="settings">{JSON.stringify(settings)}</output>
}

function renderSettings() {
  renderWithProviders(
    <>
      <Settings />
      <SettingsProbe />
    </>,
  )
}

function currentSettings() {
  return JSON.parse(screen.getByTestId('settings').textContent ?? '{}')
}

const fontSizeInput = () => screen.getByRole('spinbutton', { name: /font size/i })
const listSpacingInput = () => screen.getByRole('spinbutton', { name: /list spacing/i })

describe('Settings', () => {
  it('renders the Angular template structure', () => {
    const { container } = renderWithProviders(<Settings />)
    const root = container.firstElementChild as HTMLElement
    expect(root).toHaveClass('app-settings')
    expect(root.querySelector('#popup1.overlay > .popup')).not.toBeNull()
    expect(screen.getByRole('heading', { level: 1, name: 'Settings' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'Links',
      'Select a theme',
      'Change Font',
    ])
    expect(screen.getByText('×')).toHaveClass('close')
    expect(root.querySelector('.content .control-section')).toHaveTextContent('Open links in a new tab')
    expect(root.querySelectorAll('.theme-controls > .control-section')).toHaveLength(2)

    const radios = screen.getAllByRole('radio')
    expect(radios.map((r) => [r.getAttribute('name'), (r as HTMLInputElement).value])).toEqual([
      ['theme', 'default'],
      ['theme', 'night'],
      ['theme', 'amoledblack'],
    ])
    expect(screen.getByRole('radio', { name: 'Default' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Night' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Black (AMOLED)' })).toBeInTheDocument()
    expect(fontSizeInput()).toHaveAttribute('min', '1')
    expect(listSpacingInput()).toHaveAttribute('min', '0')
  })

  it('reflects SettingsService defaults when nothing is saved', () => {
    renderSettings()
    expect(screen.getByRole('checkbox')).not.toBeChecked()
    expect(screen.getByRole('radio', { name: 'Default' })).toBeChecked()
    expect(fontSizeInput()).toHaveValue(16)
    expect(listSpacingInput()).toHaveValue(0)
  })

  it('reflects saved preferences from localStorage', () => {
    localStorage.setItem('theme', 'amoledblack')
    localStorage.setItem('openLinkInNewTab', 'true')
    localStorage.setItem('titleFontSize', '20')
    localStorage.setItem('listSpacing', '10')
    renderSettings()
    expect(screen.getByRole('checkbox')).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Black (AMOLED)' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Default' })).not.toBeChecked()
    expect(screen.getByRole('radio', { name: 'Night' })).not.toBeChecked()
    expect(fontSizeInput()).toHaveValue(20)
    expect(listSpacingInput()).toHaveValue(10)
  })

  it('toggles openLinkInNewTab and persists it JSON-encoded', async () => {
    const user = userEvent.setup()
    renderSettings()
    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)
    expect(checkbox).toBeChecked()
    expect(currentSettings().openLinkInNewTab).toBe(true)
    expect(localStorage.getItem('openLinkInNewTab')).toBe('true')
    await user.click(checkbox)
    expect(checkbox).not.toBeChecked()
    expect(currentSettings().openLinkInNewTab).toBe(false)
    expect(localStorage.getItem('openLinkInNewTab')).toBe('false')
  })

  it('selects a theme and persists it', async () => {
    const user = userEvent.setup()
    renderSettings()
    for (const [name, value] of [
      ['Night', 'night'],
      ['Black (AMOLED)', 'amoledblack'],
      ['Default', 'default'],
    ]) {
      await user.click(screen.getByRole('radio', { name }))
      expect(screen.getByRole('radio', { name })).toBeChecked()
      expect(currentSettings().theme).toBe(value)
      expect(localStorage.getItem('theme')).toBe(value)
    }
  })

  it('updates the title font size on keyup and persists it', async () => {
    const user = userEvent.setup()
    renderSettings()
    await user.clear(fontSizeInput())
    await user.type(fontSizeInput(), '22')
    expect(currentSettings().titleFontSize).toBe('22')
    expect(localStorage.getItem('titleFontSize')).toBe('22')
  })

  it('updates the list spacing on keyup and persists it', async () => {
    const user = userEvent.setup()
    renderSettings()
    await user.clear(listSpacingInput())
    await user.type(listSpacingInput(), '5')
    expect(currentSettings().listSpacing).toBe('5')
    expect(localStorage.getItem('listSpacing')).toBe('5')
  })

  it('only applies number inputs on keyup, like the Angular (keyup) binding', () => {
    renderSettings()
    fireEvent.change(fontSizeInput(), { target: { value: '30' } })
    fireEvent.change(listSpacingInput(), { target: { value: '8' } })
    expect(currentSettings()).toMatchObject({ titleFontSize: '16', listSpacing: '0' })
    expect(localStorage.getItem('titleFontSize')).toBeNull()
    fireEvent.keyUp(fontSizeInput())
    fireEvent.keyUp(listSpacingInput())
    expect(currentSettings()).toMatchObject({ titleFontSize: '30', listSpacing: '8' })
    expect(localStorage.getItem('titleFontSize')).toBe('30')
    expect(localStorage.getItem('listSpacing')).toBe('8')
  })

  it('toggles showSettings from the close control', async () => {
    const user = userEvent.setup()
    renderSettings()
    expect(currentSettings().showSettings).toBe(false)
    await user.click(screen.getByText('×'))
    expect(currentSettings().showSettings).toBe(true)
    await user.click(screen.getByText('×'))
    expect(currentSettings().showSettings).toBe(false)
  })
})
