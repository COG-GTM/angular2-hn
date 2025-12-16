import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import Header from './components/Header';
import Loader from './components/Loader';
import './styles/App.scss';

const Feed = lazy(() => import('./components/Feed'));
const ItemDetails = lazy(() => import('./components/ItemDetails'));
const User = lazy(() => import('./components/User'));

const AppContent: React.FC = () => {
  const { settings } = useSettings();

  return (
    <div className={settings.theme}>
      <div className="body-cover">
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
        </div>
      </div>
    </div>
  );
};

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
