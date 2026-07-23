import { Navigate, Route, Routes } from 'react-router-dom';
import { Feed } from './components/feeds/Feed';
import { ItemDetailsPage } from './pages/ItemDetailsPage';
import { UserPage } from './pages/UserPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/news/1" replace />} />
      <Route path="/news/:page" element={<Feed feedType="news" />} />
      <Route path="/newest/:page" element={<Feed feedType="newest" />} />
      <Route path="/show/:page" element={<Feed feedType="show" />} />
      <Route path="/ask/:page" element={<Feed feedType="ask" />} />
      <Route path="/jobs/:page" element={<Feed feedType="jobs" />} />
      <Route path="/item/:id" element={<ItemDetailsPage />} />
      <Route path="/user/:id" element={<UserPage />} />
    </Routes>
  );
}
