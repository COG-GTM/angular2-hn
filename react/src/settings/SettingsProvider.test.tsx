import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { SettingsProvider } from './SettingsProvider'
import { useSettings } from './useSettings'

const wrapper = ({ children }: { children: ReactNode }) => <SettingsProvider>{children}</SettingsProvider>

function mockColorScheme(dark: boolean) {
  const listeners: Array<(e: MediaQueryListEvent) => void> = []
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        matches: dark,
        media: query,
        addEventListener: (_: string, l: (e: MediaQueryListEvent) => void) => listeners.push(l),
        removeEventListener: vi.fn(),
      }) as unknown as MediaQueryList,
  )
  return listeners
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('SettingsProvider', () => {
  it('uses the SettingsService defaults', () => {
    mockColorScheme(false)
    const { result } = renderHook(() => useSettings(), { wrapper })
    expect(result.current.settings).toEqual({
      showSettings: false,
      openLinkInNewTab: false,
      theme: 'default',
      titleFontSize: '16',
      listSpacing: '0',
    })
    expect(localStorage.getItem('theme')).toBe('default')
  })

  it('follows the system dark color scheme when no theme is saved', () => {
    const listeners = mockColorScheme(true)
    const { result } = renderHook(() => useSettings(), { wrapper })
    expect(result.current.settings.theme).toBe('night')
    act(() => listeners.forEach((l) => l({ matches: false } as MediaQueryListEvent)))
    expect(result.current.settings.theme).toBe('default')
  })

  it('reads saved preferences from the Angular localStorage keys', () => {
    mockColorScheme(true)
    localStorage.setItem('theme', 'amoledblack')
    localStorage.setItem('openLinkInNewTab', 'true')
    localStorage.setItem('titleFontSize', '20')
    localStorage.setItem('listSpacing', '10')
    const { result } = renderHook(() => useSettings(), { wrapper })
    expect(result.current.settings).toMatchObject({
      theme: 'amoledblack',
      openLinkInNewTab: true,
      titleFontSize: '20',
      listSpacing: '10',
    })
  })

  it('persists changes with the same keys and encodings', () => {
    mockColorScheme(false)
    const { result } = renderHook(() => useSettings(), { wrapper })
    act(() => {
      result.current.toggleSettings()
      result.current.toggleOpenLinksInNewTab()
      result.current.setTheme('night')
      result.current.setFont('24')
      result.current.setSpacing('5')
    })
    expect(result.current.settings).toEqual({
      showSettings: true,
      openLinkInNewTab: true,
      theme: 'night',
      titleFontSize: '24',
      listSpacing: '5',
    })
    expect(localStorage.getItem('openLinkInNewTab')).toBe('true')
    expect(localStorage.getItem('theme')).toBe('night')
    expect(localStorage.getItem('titleFontSize')).toBe('24')
    expect(localStorage.getItem('listSpacing')).toBe('5')
  })

  it('throws when used outside the provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => renderHook(() => useSettings())).toThrow('within a SettingsProvider')
  })
})
