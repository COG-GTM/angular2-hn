import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react'
import type { Settings, Theme } from '../models/settings'

interface SettingsContextValue {
  settings: Settings
  toggleSettings: () => void
  toggleOpenLinksInNewTab: () => void
  setTheme: (theme: Theme) => void
  setFont: (fontSize: string) => void
  setSpacing: (listSpacing: string) => void
}

const SettingsContext = createContext<SettingsContextValue | undefined>(
  undefined,
)

function getInitialSettings(): Settings {
  const darkColorScheme = window.matchMedia('(prefers-color-scheme: dark)')
  const savedTheme = localStorage.getItem('theme') as Theme | null
  const theme = savedTheme ?? (darkColorScheme.matches ? 'night' : 'default')
  if (!savedTheme) {
    localStorage.setItem('theme', theme)
  }

  const savedOpenLinks = localStorage.getItem('openLinkInNewTab')
  return {
    showSettings: false,
    openLinkInNewTab: savedOpenLinks ? JSON.parse(savedOpenLinks) : false,
    theme,
    titleFontSize: localStorage.getItem('titleFontSize') ?? '16',
    listSpacing: localStorage.getItem('listSpacing') ?? '0',
  }
}

export function SettingsProvider({ children }: PropsWithChildren) {
  const [settings, setSettings] = useState<Settings>(getInitialSettings)

  const toggleSettings = () => {
    setSettings((current) => ({
      ...current,
      showSettings: !current.showSettings,
    }))
  }

  const toggleOpenLinksInNewTab = () => {
    setSettings((current) => {
      const openLinkInNewTab = !current.openLinkInNewTab
      localStorage.setItem(
        'openLinkInNewTab',
        JSON.stringify(openLinkInNewTab),
      )
      return { ...current, openLinkInNewTab }
    })
  }

  const setTheme = (theme: Theme) => {
    localStorage.setItem('theme', theme)
    setSettings((current) => ({ ...current, theme }))
  }

  const setFont = (titleFontSize: string) => {
    localStorage.setItem('titleFontSize', titleFontSize)
    setSettings((current) => ({ ...current, titleFontSize }))
  }

  const setSpacing = (listSpacing: string) => {
    localStorage.setItem('listSpacing', listSpacing)
    setSettings((current) => ({ ...current, listSpacing }))
  }

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (event: MediaQueryListEvent) => {
      setTheme(event.matches ? 'night' : 'default')
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return (
    <SettingsContext.Provider
      value={{
        settings,
        toggleSettings,
        toggleOpenLinksInNewTab,
        setTheme,
        setFont,
        setSpacing,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
