import { Navigate, Route, Routes } from 'react-router-dom';
import { useSettings } from './context/SettingsContext';
import { Header } from './core/Header/Header';
import { Footer } from './core/Footer/Footer';
import { Feed } from './features/feeds/Feed';
import { ItemDetails } from './features/item/ItemDetails';
import { User } from './features/user/User';
import './App.scss';

export function App() {
  const { settings } = useSettings();

  return (
    <div className={settings.theme}>
      <div className="body-cover"></div>
      <div className="wrapper">
        <Header />
        <Routes>
          <Route path="/" element={<Navigate to="/news/1" replace />} />
          <Route path="/item/:id" element={<ItemDetails />} />
          <Route path="/user/:id" element={<User />} />
          <Route path="/:feedType/:page" element={<Feed />} />
        </Routes>
        <Footer />
      </div>
    </div>
  );
}
