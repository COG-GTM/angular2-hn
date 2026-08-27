import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { FeedPage } from './pages/FeedPage';
import { Loader } from './components/Loader';

const ItemDetails = lazy(() => import('./pages/ItemDetails').then((module) => ({ default: module.ItemDetails })));
const UserProfile = lazy(() => import('./pages/UserProfile').then((module) => ({ default: module.UserProfile })));

export function App() {
  return <Suspense fallback={<Loader />}><Routes>
    <Route path="/" element={<Navigate to="/news/1" replace />} />
    <Route path="/news/:page" element={<FeedPage feedType="news" />} />
    <Route path="/newest/:page" element={<FeedPage feedType="newest" />} />
    <Route path="/show/:page" element={<FeedPage feedType="show" />} />
    <Route path="/ask/:page" element={<FeedPage feedType="ask" />} />
    <Route path="/jobs/:page" element={<FeedPage feedType="jobs" />} />
    <Route path="/item/:id" element={<ItemDetails />} />
    <Route path="/user/:id" element={<UserProfile />} />
    <Route path="*" element={<Navigate to="/news/1" replace />} />
  </Routes></Suspense>;
}
