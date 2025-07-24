import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from '../components/core/Header';
import { Footer } from '../components/core/Footer';
import { Settings } from '../components/core/Settings';

const FeedPage = ({ feedType }: { feedType: string }) => (
  <div className="container mx-auto p-4">
    <h2 className="text-2xl font-bold mb-4 capitalize">{feedType}</h2>
    <p className="text-gray-600">Feed component will be implemented in Phase 2</p>
  </div>
);

const ItemDetailsPage = () => (
  <div className="container mx-auto p-4">
    <h2 className="text-2xl font-bold mb-4">Item Details</h2>
    <p className="text-gray-600">Item details component will be implemented in Phase 2</p>
  </div>
);

const UserPage = () => (
  <div className="container mx-auto p-4">
    <h2 className="text-2xl font-bold mb-4">User Profile</h2>
    <p className="text-gray-600">User component will be implemented in Phase 2</p>
  </div>
);

export const AppRouter: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
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
        </main>
        <Footer />
        <Settings />
      </div>
    </Router>
  );
};
