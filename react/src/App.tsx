import { Footer } from './core/Footer/Footer'
import { Header } from './core/Header/Header'
import { AppRoutes } from './routes'
import { useSettings } from './settings'
import './App.scss'

// Port of src/app/app.component.{ts,html}. The root element stands in for the Angular `<app-root>` host.
// Needs SettingsProvider and a router above it (see main.tsx).
export function App() {
  const { settings } = useSettings()

  return (
    <div className="app-root">
      <div className={settings.theme}>
        <div className="body-cover"></div>
        <div className="wrapper">
          <Header />
          <AppRoutes />
          <Footer />
        </div>
      </div>
    </div>
  )
}
