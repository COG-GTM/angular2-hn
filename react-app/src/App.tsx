import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { SettingsProvider } from './context/SettingsContext'
import { useSettings } from './hooks/useSettings'
import Feed from './pages/Feed'
import Header from './components/Header'
import Footer from './components/Footer'
import Loader from './components/Loader'

const ItemDetails = lazy(() => import('./pages/ItemDetails'))
const User = lazy(() => import('./pages/User'))

declare global {
  interface Window {
    ga?: (...args: unknown[]) => void
  }
}

function Analytics() {
  const location = useLocation()

  useEffect(() => {
    window.ga?.('set', 'page', location.pathname + location.search)
    window.ga?.('send', 'pageview')
  }, [location.pathname, location.search])

  return null
}

function AppShell() {
  const settings = useSettings()

  return (
    <div className={settings.theme}>
      <div className="body-cover" />
      <div className="wrapper">
        <Header />
        <Analytics />
        <Routes>
          <Route path="/" element={<Navigate to="/news/1" replace />} />
          <Route path="/news/:page" element={<Feed key="news" feedType="news" />} />
          <Route path="/newest/:page" element={<Feed key="newest" feedType="newest" />} />
          <Route path="/show/:page" element={<Feed key="show" feedType="show" />} />
          <Route path="/ask/:page" element={<Feed key="ask" feedType="ask" />} />
          <Route path="/jobs/:page" element={<Feed key="jobs" feedType="jobs" />} />
          <Route path="/item/:id" element={<Suspense fallback={<Loader />}><ItemDetails /></Suspense>} />
          <Route path="/user/:id" element={<Suspense fallback={<Loader />}><User /></Suspense>} />
          <Route path="*" element={<Navigate to="/news/1" replace />} />
        </Routes>
        <Footer />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <SettingsProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </SettingsProvider>
  )
}
