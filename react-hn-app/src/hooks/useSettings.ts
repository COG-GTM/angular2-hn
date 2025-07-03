import { useState, useCallback } from 'react'
import { Settings } from '../types'

const defaultSettings: Settings = {
  showSettings: false,
  openLinkInNewTab: false,
  theme: 'default',
  titleFontSize: '16',
  listSpacing: '0',
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('hn-settings')
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) }
      } catch {
        return defaultSettings
      }
    }
    return {
      ...defaultSettings,
      openLinkInNewTab: localStorage.getItem('openLinkInNewTab') 
        ? JSON.parse(localStorage.getItem('openLinkInNewTab')!) 
        : false,
      titleFontSize: localStorage.getItem('titleFontSize') || '16',
      listSpacing: localStorage.getItem('listSpacing') || '0',
    }
  })

  const saveSettings = useCallback((newSettings: Partial<Settings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings }
      localStorage.setItem('hn-settings', JSON.stringify(updated))
      return updated
    })
  }, [])

  const toggleSettings = useCallback(() => {
    saveSettings({ showSettings: !settings.showSettings })
  }, [settings.showSettings, saveSettings])

  const toggleOpenLinksInNewTab = useCallback(() => {
    const newValue = !settings.openLinkInNewTab
    saveSettings({ openLinkInNewTab: newValue })
    localStorage.setItem('openLinkInNewTab', JSON.stringify(newValue))
  }, [settings.openLinkInNewTab, saveSettings])

  const setTheme = useCallback((theme: string) => {
    saveSettings({ theme })
    localStorage.setItem('theme', theme)
  }, [saveSettings])

  const setFont = useCallback((fontSize: string) => {
    saveSettings({ titleFontSize: fontSize })
    localStorage.setItem('titleFontSize', fontSize)
  }, [saveSettings])

  const setSpacing = useCallback((listSpacing: string) => {
    saveSettings({ listSpacing })
    localStorage.setItem('listSpacing', listSpacing)
  }, [saveSettings])

  const initTheme = useCallback(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      setSettings(prev => ({ ...prev, theme: savedTheme }))
    } else {
      const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)')
      const theme = darkColorSchemeMedia.matches ? 'night' : 'default'
      setTheme(theme)
      
      const handleChange = (e: MediaQueryListEvent) => {
        const newTheme = e.matches ? 'night' : 'default'
        setTheme(newTheme)
      }
      
      darkColorSchemeMedia.addEventListener('change', handleChange)
      return () => darkColorSchemeMedia.removeEventListener('change', handleChange)
    }
  }, [setTheme])

  return {
    settings,
    toggleSettings,
    toggleOpenLinksInNewTab,
    setTheme,
    setFont,
    setSpacing,
    initTheme,
  }
}
