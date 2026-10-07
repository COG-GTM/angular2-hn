import { useContext } from 'react'
import { SettingsContext } from '../context/settingsContext'

export function useSettings() {
  const settings = useContext(SettingsContext)
  if (!settings) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return settings
}
