import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SettingsProvider, useSettings } from './context/SettingsContext'
import { Header } from './components/Header/Header'
import { Footer } from './components/Footer/Footer'
import { Loader } from './components/Loader/Loader'
import { Feed } from './pages/Feed/Feed'
import './App.scss'

const ItemDetails = lazy(() => import('./pages/ItemDetails/ItemDetails'))
const User = lazy(() => import('./pages/User/User'))

function AppShell() {
    const { settings } = useSettings()

    return (
        <div className={settings.theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <Header />
                <Suspense fallback={<Loader />}>
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
                </Suspense>
                <Footer />
            </div>
        </div>
    )
}

function App() {
    return (
        <BrowserRouter>
            <SettingsProvider>
                <AppShell />
            </SettingsProvider>
        </BrowserRouter>
    )
}

export default App
