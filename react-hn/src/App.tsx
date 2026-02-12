import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SettingsProvider } from './contexts/SettingsContext';
import { Feed } from './components/feeds/Feed';

const ItemDetails = lazy(() => import('./components/item-details/ItemDetails'));
const User = lazy(() => import('./components/user/User'));

function App() {
  return (
    <SettingsProvider>
      <BrowserRouter>
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
              <Suspense fallback={<p>Loading...</p>}>
                <ItemDetails />
              </Suspense>
            }
          />
          <Route
            path="/user/:id"
            element={
              <Suspense fallback={<p>Loading...</p>}>
                <User />
              </Suspense>
            }
          />
        </Routes>
      </BrowserRouter>
    </SettingsProvider>
  );
}

export default App;
