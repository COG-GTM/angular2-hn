import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SettingsProvider } from './contexts';
import { Feed } from './components/feeds';

const ItemDetails = lazy(() =>
  import('./components/item-details').then((module) => ({ default: module.ItemDetails }))
);

const User = lazy(() =>
  import('./components/user').then((module) => ({ default: module.User }))
);

function LoadingFallback() {
  return <div className="loader">Loading...</div>;
}

function App() {
  return (
    <SettingsProvider>
      <BrowserRouter>
        <div className="app">
          <Routes>
            <Route path="/" element={<Navigate to="/news/1" replace />} />

            <Route path="/news/:page" element={<Feed feedType="news" />} />
            <Route path="/newest/:page" element={<Feed feedType="newest" />} />
            <Route path="/show/:page" element={<Feed feedType="show" />} />
            <Route path="/ask/:page" element={<Feed feedType="ask" />} />
            <Route path="/jobs/:page" element={<Feed feedType="jobs" />} />

            <Route
              path="/item/:id"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <ItemDetails />
                </Suspense>
              }
            />

            <Route
              path="/user/:id"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <User />
                </Suspense>
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </SettingsProvider>
  );
}

export default App;
