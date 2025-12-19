import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { Header, Footer } from './components/core';
import { Feed } from './components/feeds';
import { Loader } from './components/shared';

const ItemDetails = lazy(() => import('./components/item-details/ItemDetails'));
const User = lazy(() => import('./components/user/User'));

const AppContent: React.FC = () => {
  const { settings } = useSettings();

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
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <AppContent />
      </SettingsProvider>
    </BrowserRouter>
  );
};

export default App;
