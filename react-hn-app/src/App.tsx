import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { ThemeProvider } from 'next-themes'
import Header from './components/Header'
import Footer from './components/Footer'
import FeedPage from './pages/FeedPage'
import ItemDetailsPage from './pages/ItemDetailsPage'
import UserPage from './pages/UserPage'
import { useSettings } from './hooks/useSettings'
import './App.css'

function App() {
  const { settings, initTheme } = useSettings()

  useEffect(() => {
    initTheme()
  }, [initTheme])

  useEffect(() => {
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('config', 'UA-66348622-3', {
        page_path: window.location.pathname,
      })
    }
  }, [])

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className={`app ${settings.theme}`}>
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/news/1" replace />} />
            <Route path="/news/:page" element={<FeedPage feedType="news" />} />
            <Route path="/newest/:page" element={<FeedPage feedType="newest" />} />
            <Route path="/show/:page" element={<FeedPage feedType="show" />} />
            <Route path="/ask/:page" element={<FeedPage feedType="ask" />} />
            <Route path="/jobs/:page" element={<FeedPage feedType="jobs" />} />
            <Route path="/item/:id" element={<ItemDetailsPage />} />
            <Route path="/user/:id" element={<UserPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  )
}

export default App
