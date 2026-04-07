import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Feed from './components/Feed';
import ItemDetails from './components/ItemDetails';
import UserProfile from './components/UserProfile';

function AppLayout() {
  const { settings } = useSettings();
  return (
    <div className={settings.theme}>
      <div className="body-cover" />
      <div className="wrapper">
        <Header />
        <Routes>
          <Route path="/" element={<Navigate to="/news/1" replace />} />
          <Route path="/:feedType/:page" element={<Feed />} />
          <Route path="/item/:id" element={<ItemDetails />} />
          <Route path="/user/:id" element={<UserProfile />} />
        </Routes>
        <Footer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <AppLayout />
      </SettingsProvider>
    </BrowserRouter>
  );
}
