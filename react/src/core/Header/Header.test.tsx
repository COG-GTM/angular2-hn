// CHAR-33 parity test for src/app/core/header/header.component.{html,ts}: same markup (home link, logo, nav links
// with ' | ' separators, settings cog), routerLinkActive="active" semantics (non-exact: /x/1 and its descendants,
// not /x/2), (click)="scrollTop()" on every link, and <app-settings *ngIf="settings.showSettings">.
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test/renderWithProviders'
import { Header } from './Header'

const NAV = [
  ['new', '/newest/1'],
  ['show', '/show/1'],
  ['ask', '/ask/1'],
  ['jobs', '/jobs/1'],
]

const homeLink = () => screen.getByRole('link', { name: 'Logo' })
const settingsPanel = () => document.querySelector('.app-settings')

describe('Header', () => {
  let scrollTo: ReturnType<typeof vi.fn>

  beforeEach(() => {
    scrollTo = vi.fn()
    vi.stubGlobal('scrollTo', scrollTo)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the Angular template structure', () => {
    const { container } = renderWithProviders(<Header />)
    const root = container.firstElementChild as HTMLElement
    expect(root.tagName).toBe('HEADER')
    expect(root).toHaveClass('app-header')
    expect(root.querySelector('#header > a.home-link > .logo-inner + img.logo')).not.toBeNull()
    expect(root.querySelector('#header > .header-text > .left > .header-nav')).not.toBeNull()
    expect(homeLink()).toHaveAttribute('href', '/news/1')
    expect(screen.getByAltText('Logo')).toHaveAttribute('src', '/assets/images/logo.svg')
    const cog = screen.getByAltText('Settings')
    expect(cog).toHaveClass('settings')
    expect(cog).toHaveAttribute('src', '/assets/images/cog.svg')
    expect(root.querySelector('#header > .info > img.settings')).toBe(cog)
    expect(settingsPanel()).toBeNull()
  })

  it('renders the nav links with their hrefs, labels and separators', () => {
    const { container } = renderWithProviders(<Header />)
    const nav = container.querySelector('.header-nav') as HTMLElement
    const links = Array.from(nav.querySelectorAll('a'))
    expect(links.map((a) => [a.textContent, a.getAttribute('href')])).toEqual(NAV)
    expect(nav.textContent?.replace(/\s+/g, ' ').trim()).toBe('new | show | ask | jobs')
  })

  it.each(NAV)('marks the %s link active on %s and its descendants, like routerLinkActive', (label, href) => {
    renderWithProviders(<Header />, { route: href, path: href.replace('/1', '/:page/*') })
    expect(screen.getByRole('link', { name: label })).toHaveClass('active')
    for (const [other] of NAV.filter(([l]) => l !== label)) {
      expect(screen.getByRole('link', { name: other })).not.toHaveClass('active')
    }
    expect(homeLink()).not.toHaveClass('active')
  })

  it('marks a nav link active on a descendant route of its URL', () => {
    renderWithProviders(<Header />, { route: '/show/1/extra', path: '/show/:page/*' })
    expect(screen.getByRole('link', { name: 'show' })).toHaveClass('active')
  })

  it('does not mark a nav link active on another page of the same feed', () => {
    renderWithProviders(<Header />, { route: '/newest/2', path: '/newest/:page' })
    for (const [label] of NAV) {
      expect(screen.getByRole('link', { name: label })).not.toHaveClass('active')
    }
  })

  it('marks the home link active on /news/1 only', () => {
    const { unmount } = renderWithProviders(<Header />, { route: '/news/1', path: '/news/:page' })
    expect(homeLink()).toHaveClass('active')
    unmount()
    renderWithProviders(<Header />, { route: '/news/2', path: '/news/:page' })
    expect(homeLink()).not.toHaveClass('active')
  })

  it.each([...NAV.map(([label]) => label), 'Logo'])('scrolls to the top when the %s link is clicked', async (name) => {
    const user = userEvent.setup()
    renderWithProviders(<Header />, { route: '/news/2', path: '*' })
    await user.click(screen.getByRole('link', { name }))
    expect(scrollTo).toHaveBeenCalledTimes(1)
    expect(scrollTo).toHaveBeenCalledWith(0, 0)
  })

  it('shows the settings panel from the cog and hides it from the panel close control', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Header />)
    expect(settingsPanel()).toBeNull()
    await user.click(screen.getByAltText('Settings'))
    expect(settingsPanel()).not.toBeNull()
    expect(screen.getByRole('heading', { level: 1, name: 'Settings' })).toBeInTheDocument()
    await user.click(screen.getByText('×'))
    expect(settingsPanel()).toBeNull()
  })

  it('toggles the settings panel off when the cog is clicked again', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Header />)
    await user.click(screen.getByAltText('Settings'))
    expect(settingsPanel()).not.toBeNull()
    await user.click(screen.getByAltText('Settings'))
    expect(settingsPanel()).toBeNull()
  })
})
