import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Settings } from '../types/Settings'
import { SettingsContext, type SettingsContextValue } from './settingsContext'

function getInitialSettings(): Settings {
  const savedTheme = localStorage.getItem('theme')
  const theme = savedTheme ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'default')
  if (savedTheme === null) {
    localStorage.setItem('theme', theme)
  }
  const openLinks = localStorage.getItem('openLinkInNewTab')
  return {
    showSettings: false,
    openLinkInNewTab: openLinks ? JSON.parse(openLinks) as boolean : false,
    theme,
    titleFontSize: localStorage.getItem('titleFontSize') ?? '16',
    listSpacing: localStorage.getItem('listSpacing') ?? '0',
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(getInitialSettings)

  const setTheme = useCallback((theme: string) => {
    localStorage.setItem('theme', theme)
    setSettings((current) => ({ ...current, theme }))
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (event: MediaQueryListEvent) => setTheme(event.matches ? 'night' : 'default')
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [setTheme])

  const value = useMemo<SettingsContextValue>(() => ({
    ...settings,
    toggleSettings: () => setSettings((current) => ({ ...current, showSettings: !current.showSettings })),
    toggleOpenLinksInNewTab: () => setSettings((current) => {
      const openLinkInNewTab = !current.openLinkInNewTab
      localStorage.setItem('openLinkInNewTab', JSON.stringify(openLinkInNewTab))
      return { ...current, openLinkInNewTab }
    }),
    setTheme,
    setFont: (titleFontSize: string) => {
      localStorage.setItem('titleFontSize', titleFontSize)
      setSettings((current) => ({ ...current, titleFontSize }))
    },
    setSpacing: (listSpacing: string) => {
      localStorage.setItem('listSpacing', listSpacing)
      setSettings((current) => ({ ...current, listSpacing }))
    },
  }), [settings, setTheme])

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}
