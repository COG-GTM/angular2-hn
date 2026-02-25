import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import ReactGA from 'react-ga4';
import { SettingsProvider, useSettings } from './SettingsContext';
import Header from './components/Header';
import Footer from './components/Footer';
import FeedPage from './pages/FeedPage';
import ItemDetailsPage from './pages/ItemDetailsPage';
import UserPage from './pages/UserPage';

ReactGA.initialize('UA-66348622-3');

function Analytics() {
  const location = useLocation();
  useEffect(() => {
    ReactGA.send({ hitType: 'pageview', page: location.pathname + location.search });
  }, [location]);
  return null;
}

function AppShell() {
  const { settings } = useSettings();
  return (
    <div className={settings.theme}>
      <div className="body-cover"></div>
      <div className="wrapper">
        <Header />
        <Routes>
          <Route path="/" element={<Navigate to="/news/1" />} />
          <Route path="/:feedType/:page" element={<FeedPage />} />
          <Route path="/item/:id" element={<ItemDetailsPage />} />
          <Route path="/user/:id" element={<UserPage />} />
        </Routes>
        <Footer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <BrowserRouter>
        <Analytics />
        <AppShell />
      </BrowserRouter>
    </SettingsProvider>
  );
}
