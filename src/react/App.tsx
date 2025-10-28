import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SettingsProvider } from './contexts/SettingsContext';
import { FeedPage } from './pages/FeedPage';

const ItemDetailsPage = lazy(() => 
  import('./pages/ItemDetailsPage').then(module => ({ default: module.ItemDetailsPage }))
);

const UserPage = lazy(() => 
  import('./pages/UserPage').then(module => ({ default: module.UserPage }))
);

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <BrowserRouter>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Navigate to="/news/1" replace />} />
            
            <Route path="/news/:page" element={<FeedPage />} />
            <Route path="/newest/:page" element={<FeedPage />} />
            <Route path="/show/:page" element={<FeedPage />} />
            <Route path="/ask/:page" element={<FeedPage />} />
            <Route path="/jobs/:page" element={<FeedPage />} />
            
            <Route path="/item/:id" element={<ItemDetailsPage />} />
            <Route path="/user/:id" element={<UserPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </SettingsProvider>
  );
};

export default App;
