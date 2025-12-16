import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SettingsProvider, useSettings } from './hooks';
import { Header, Footer } from './components/core';
import { Loader } from './components/shared';
import './App.scss';

const Feed = lazy(() => import('./components/feeds/Feed').then(m => ({ default: m.Feed })));
const ItemDetails = lazy(() => import('./components/item-details/ItemDetails').then(m => ({ default: m.ItemDetails })));
const User = lazy(() => import('./components/user/User').then(m => ({ default: m.User })));

function AppContent() {
  const { settings } = useSettings();

  useEffect(() => {
    document.body.className = settings.theme;
  }, [settings.theme]);

  return (
    <div className={`app-container ${settings.theme}`}>
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
  );
}

function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <AppContent />
      </SettingsProvider>
    </BrowserRouter>
  );
}

export default App;
