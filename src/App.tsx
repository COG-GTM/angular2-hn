import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { SettingsProvider } from './contexts/SettingsContext'
import FeedPage from './pages/FeedPage'
import ItemDetailsPage from './pages/ItemDetailsPage'
import UserPage from './pages/UserPage'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import Settings from './components/Settings/Settings'

function App() {
  return (
    <SettingsProvider>
      <div className="app">
        <Header />
        <main>
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
        <Settings />
      </div>
    </SettingsProvider>
  )
}

export default App
