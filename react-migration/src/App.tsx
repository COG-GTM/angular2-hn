import { Routes, Route, Navigate } from 'react-router-dom'
import { SettingsProvider } from './hooks/useSettings'
import Header from './components/core/Header'
import Footer from './components/core/Footer'
import Feed from './components/feeds/Feed'
import ItemDetails from './components/item-details/ItemDetails'
import User from './components/user/User'
import './App.css'

function App() {
  return (
    <SettingsProvider>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/news/1" replace />} />
            <Route path="/news/:page" element={<Feed feedType="news" />} />
            <Route path="/newest/:page" element={<Feed feedType="newest" />} />
            <Route path="/show/:page" element={<Feed feedType="show" />} />
            <Route path="/ask/:page" element={<Feed feedType="ask" />} />
            <Route path="/jobs/:page" element={<Feed feedType="jobs" />} />
            <Route path="/item/:id" element={<ItemDetails />} />
            <Route path="/user/:id" element={<User />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </SettingsProvider>
  )
}

export default App
