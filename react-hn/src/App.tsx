import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import { useSettings } from './context/useSettings';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Feed } from './components/feeds/Feed';
import { ItemDetails } from './components/item-details/ItemDetails';
import { UserProfile } from './components/user/UserProfile';
import './styles/global.scss';
import './styles/App.scss';

function AppShell() {
  const { settings } = useSettings();

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

export function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <AppShell />
      </SettingsProvider>
    </BrowserRouter>
  );
}
