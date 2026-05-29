import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { Header } from './components/Header/Header';
import { Footer } from './components/Footer/Footer';
import { Feed } from './pages/Feed/Feed';
import { ItemDetails } from './pages/ItemDetails/ItemDetails';
import { UserProfile } from './pages/UserProfile/UserProfile';
import './styles/themes.scss';

declare let ga: (command: string, ...args: string[]) => void;

function AppShell() {
  const { settings } = useSettings();
  const location = useLocation();

  useEffect(() => {
    if (typeof ga === 'function') {
      ga('set', 'page', location.pathname);
      ga('send', 'pageview');
    }
  }, [location.pathname]);

  return (
    <div className={settings.theme}>
      <div className="body-cover"></div>
      <div className="wrapper">
        <Header />
        <Routes>
          <Route path="/" element={<Navigate to="/news/1" replace />} />
          <Route path="/news/:page" element={<Feed feedType="news" />} />
          <Route path="/newest/:page" element={<Feed feedType="newest" />} />
          <Route path="/show/:page" element={<Feed feedType="show" />} />
          <Route path="/ask/:page" element={<Feed feedType="ask" />} />
          <Route path="/jobs/:page" element={<Feed feedType="jobs" />} />
          <Route path="/item/:id" element={<ItemDetails />} />
          <Route path="/user/:id" element={<UserProfile />} />
        </Routes>
        <Footer />
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <AppShell />
      </SettingsProvider>
    </BrowserRouter>
  );
}

export default App;
