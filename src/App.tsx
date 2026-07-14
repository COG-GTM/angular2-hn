import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import { SettingsProvider } from './context/SettingsContext';
import Feed from './pages/Feed';
import ItemDetails from './pages/ItemDetails';
import User from './pages/User';

export default function App() {
  return (
    <SettingsProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/news/1" replace />} />
            <Route path="news/:page" element={<Feed feedType="news" />} />
            <Route path="newest/:page" element={<Feed feedType="newest" />} />
            <Route path="show/:page" element={<Feed feedType="show" />} />
            <Route path="ask/:page" element={<Feed feedType="ask" />} />
            <Route path="jobs/:page" element={<Feed feedType="jobs" />} />
            <Route path="item/:id" element={<ItemDetails />} />
            <Route path="user/:id" element={<User />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SettingsProvider>
  );
}
