import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './components/App';
import Feed from './components/Feed';
import Loader from './components/Loader';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import './styles.scss';

const ItemDetails = lazy(() => import('./components/ItemDetails'));
const UserProfile = lazy(() => import('./components/UserProfile'));

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/news/1" replace />} />
        <Route element={<App />}>
          <Route path="/news/:page" element={<Feed feedType="news" />} />
          <Route path="/newest/:page" element={<Feed feedType="newest" />} />
          <Route path="/show/:page" element={<Feed feedType="show" />} />
          <Route path="/ask/:page" element={<Feed feedType="ask" />} />
          <Route path="/jobs/:page" element={<Feed feedType="jobs" />} />
          <Route
            path="/item/:id"
            element={
              <Suspense fallback={<Loader />}>
                <ItemDetails />
              </Suspense>
            }
          />
          <Route
            path="/user/:id"
            element={
              <Suspense fallback={<Loader />}>
                <UserProfile />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

// Register service worker for PWA support
serviceWorkerRegistration.register();
