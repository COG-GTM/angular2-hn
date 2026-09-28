import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { SettingsContext, type Settings, type SettingsContextValue } from './settingsContext'

// Port of src/app/shared/services/settings.service.ts. localStorage keys and value encodings are unchanged
// so preferences carry over between the Angular and React apps.
const DARK_COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)'

function systemTheme(matches: boolean): string {
  return matches ? 'night' : 'default'
}

function loadInitialSettings(): Settings {
  const openLinkInNewTab = localStorage.getItem('openLinkInNewTab')
  const savedTheme = localStorage.getItem('theme')
  const theme = savedTheme || systemTheme(window.matchMedia(DARK_COLOR_SCHEME_QUERY).matches)
  if (!savedTheme) {
    localStorage.setItem('theme', theme)
  }
  return {
    showSettings: false,
    openLinkInNewTab: openLinkInNewTab ? (JSON.parse(openLinkInNewTab) as boolean) : false,
    theme,
    titleFontSize: localStorage.getItem('titleFontSize') || '16',
    listSpacing: localStorage.getItem('listSpacing') || '0',
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(loadInitialSettings)

  const setTheme = useCallback((theme: string) => {
    localStorage.setItem('theme', theme)
    setSettings((s) => ({ ...s, theme }))
  }, [])

  useEffect(() => {
    const media = window.matchMedia(DARK_COLOR_SCHEME_QUERY)
    const onChange = (event: MediaQueryListEvent) => setTheme(systemTheme(event.matches))
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [setTheme])

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      setTheme,
      toggleSettings: () => setSettings((s) => ({ ...s, showSettings: !s.showSettings })),
      toggleOpenLinksInNewTab: () =>
        setSettings((s) => {
          const openLinkInNewTab = !s.openLinkInNewTab
          localStorage.setItem('openLinkInNewTab', JSON.stringify(openLinkInNewTab))
          return { ...s, openLinkInNewTab }
        }),
      setFont: (titleFontSize: string) => {
        localStorage.setItem('titleFontSize', titleFontSize)
        setSettings((s) => ({ ...s, titleFontSize }))
      },
      setSpacing: (listSpacing: string) => {
        localStorage.setItem('listSpacing', listSpacing)
        setSettings((s) => ({ ...s, listSpacing }))
      },
    }),
    [settings, setTheme],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}
