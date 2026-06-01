import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { Settings } from '../types'

interface SettingsContextValue {
    settings: Settings
    toggleSettings: () => void
    toggleOpenLinksInNewTab: () => void
    setTheme: (theme: string) => void
    setFont: (fontSize: string) => void
    setSpacing: (listSpace: string) => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

function getInitialSettings(): Settings {
    return {
        showSettings: false,
        openLinkInNewTab: localStorage.getItem('openLinkInNewTab')
            ? JSON.parse(localStorage.getItem('openLinkInNewTab')!)
            : false,
        theme: localStorage.getItem('theme') || '',
        titleFontSize: localStorage.getItem('titleFontSize') || '16',
        listSpacing: localStorage.getItem('listSpacing') || '0',
    }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(getInitialSettings)

    useEffect(() => {
        if (!settings.theme) {
            const darkMedia = window.matchMedia('(prefers-color-scheme: dark)')
            const theme = darkMedia.matches ? 'night' : 'default'
            setSettings((prev) => ({ ...prev, theme }))
        }
    }, [settings.theme])

    useEffect(() => {
        const darkMedia = window.matchMedia('(prefers-color-scheme: dark)')
        const handler = (e: MediaQueryListEvent) => {
            const theme = e.matches ? 'night' : 'default'
            setSettings((prev) => {
                localStorage.setItem('theme', theme)
                return { ...prev, theme }
            })
        }
        darkMedia.addEventListener('change', handler)
        return () => darkMedia.removeEventListener('change', handler)
    }, [])

    const toggleSettings = useCallback(() => {
        setSettings((prev) => ({ ...prev, showSettings: !prev.showSettings }))
    }, [])

    const toggleOpenLinksInNewTab = useCallback(() => {
        setSettings((prev) => {
            const next = !prev.openLinkInNewTab
            localStorage.setItem('openLinkInNewTab', JSON.stringify(next))
            return { ...prev, openLinkInNewTab: next }
        })
    }, [])

    const setTheme = useCallback((theme: string) => {
        setSettings((prev) => {
            localStorage.setItem('theme', theme)
            return { ...prev, theme }
        })
    }, [])

    const setFont = useCallback((fontSize: string) => {
        setSettings((prev) => {
            localStorage.setItem('titleFontSize', fontSize)
            return { ...prev, titleFontSize: fontSize }
        })
    }, [])

    const setSpacing = useCallback((listSpace: string) => {
        setSettings((prev) => {
            localStorage.setItem('listSpacing', listSpace)
            return { ...prev, listSpacing: listSpace }
        })
    }, [])

    return (
        <SettingsContext.Provider
            value={{ settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing }}
        >
            {children}
        </SettingsContext.Provider>
    )
}

export function useSettings(): SettingsContextValue {
    const ctx = useContext(SettingsContext)
    if (!ctx) {
        throw new Error('useSettings must be used within a SettingsProvider')
    }
    return ctx
}
