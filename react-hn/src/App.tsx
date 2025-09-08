import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { SettingsProvider } from './contexts/SettingsContext';
import Layout from './components/Layout';
import FeedPage from './pages/FeedPage';
import ItemDetailsPage from './pages/ItemDetailsPage';
import UserPage from './pages/UserPage';
import './App.css';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <SettingsProvider>
        <Router>
          <Layout>
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
          </Layout>
        </Router>
      </SettingsProvider>
    </Provider>
  );
};

export default App;
