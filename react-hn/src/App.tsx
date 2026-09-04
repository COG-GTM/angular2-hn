import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import Footer from './components/Footer/Footer';
import Header from './components/Header/Header';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import Feed from './pages/Feed/Feed';
import ItemDetails from './pages/ItemDetails/ItemDetails';
import User from './pages/User/User';

const FEED_TYPES = ['news', 'newest', 'show', 'ask', 'jobs'];

const Layout: React.FC = () => {
  const { settings } = useSettings();

  return (
    <div className={settings.theme}>
      <div className="body-cover" />
      <div className="wrapper">
        <Header />
        <Routes>
          <Route path="/" element={<Navigate to="/news/1" replace />} />
          {FEED_TYPES.map(feedType => (
            <Route key={feedType} path={`/${feedType}/:page`} element={<Feed feedType={feedType} />} />
          ))}
          <Route path="/item/:id" element={<ItemDetails />} />
          <Route path="/user/:id" element={<User />} />
        </Routes>
        <Footer />
      </div>
    </div>
  );
};

const App: React.FC = () => (
  <SettingsProvider>
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  </SettingsProvider>
);

export default App;
