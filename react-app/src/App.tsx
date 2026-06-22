import { Navigate, Route, Routes } from 'react-router-dom';
import { useSettings } from './context/SettingsContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Feed } from './pages/Feed';
import { ItemDetails } from './pages/ItemDetails';
import { User } from './pages/User';

export function App() {
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
          <Route path="/user/:id" element={<User />} />
        </Routes>
        <Footer />
      </div>
    </div>
  );
}
