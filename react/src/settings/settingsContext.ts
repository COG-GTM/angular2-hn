import { createContext } from 'react'

export interface Settings {
  showSettings: boolean
  openLinkInNewTab: boolean
  theme: string
  titleFontSize: string
  listSpacing: string
}

export interface SettingsContextValue {
  settings: Settings
  toggleSettings: () => void
  toggleOpenLinksInNewTab: () => void
  setTheme: (theme: string) => void
  setFont: (fontSize: string) => void
  setSpacing: (listSpacing: string) => void
}

export const SettingsContext = createContext<SettingsContextValue | undefined>(undefined)
