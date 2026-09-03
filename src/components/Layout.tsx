import { Outlet } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { Footer } from './Footer'
import { Header } from './Header'
import './Layout.scss'
import { usePageTracking } from '../hooks/usePageTracking'

export function Layout() {
  const { settings } = useSettings()
  usePageTracking()

  return (
    <div className={settings.theme}>
      <div className="body-cover" />
      <div className="wrapper">
        <Header />
        <Outlet />
        <Footer />
      </div>
    </div>
  )
}
