import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

const FeedPage = lazy(() => import('./pages/FeedPage'));
const ItemDetailsPage = lazy(() => import('./pages/ItemDetailsPage'));
const UserPage = lazy(() => import('./pages/UserPage'));

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Navigate to="/news/1" replace />} />
        
        <Route path="/news/:page" element={<FeedPage feedType="news" />} />
        <Route path="/newest/:page" element={<FeedPage feedType="newest" />} />
        <Route path="/show/:page" element={<FeedPage feedType="show" />} />
        <Route path="/ask/:page" element={<FeedPage feedType="ask" />} />
        <Route path="/jobs/:page" element={<FeedPage feedType="jobs" />} />
        
        <Route path="/item/:id" element={<ItemDetailsPage />} />
        <Route path="/user/:id" element={<UserPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
