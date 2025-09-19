import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SettingsProvider } from './contexts/SettingsContext';
import { Feed } from './components/Feed';
import { Loader } from './components/Loader';

const ItemDetails = lazy(() => import('./components/ItemDetails').then(module => ({ default: module.ItemDetails })));
const User = lazy(() => import('./components/User').then(module => ({ default: module.User })));

function App() {
  return (
    <SettingsProvider>
      <Router>
        <div className="App">
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="/" element={<Navigate to="/news/1" replace />} />
              <Route path="/news/:page" element={<Feed feedType="news" />} />
              <Route path="/newest/:page" element={<Feed feedType="newest" />} />
              <Route path="/show/:page" element={<Feed feedType="show" />} />
              <Route path="/ask/:page" element={<Feed feedType="ask" />} />
              <Route path="/jobs/:page" element={<Feed feedType="jobs" />} />
              <Route path="/item/:id" element={<ItemDetails />} />
              <Route path="/user/:id" element={<User />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </SettingsProvider>
  );
}

export default App;
