import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Footer from './components/layout/Footer';
import Header from './components/layout/Header';
import Loader from './components/Loader/Loader';
import { useSettings } from './context/SettingsContext';
import Feed from './pages/Feed/Feed';

const ItemDetails = lazy(() => import('./pages/ItemDetails/ItemDetails'));
const User = lazy(() => import('./pages/User/User'));

export const FEED_TYPES = ['news', 'newest', 'show', 'ask', 'jobs'] as const;

export function App() {
  const { settings } = useSettings();

  return (
    <div className={settings.theme}>
      <div className="body-cover" />
      <div className="wrapper">
        <Header />
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<Navigate to="/news/1" replace />} />
            {FEED_TYPES.map((feedType) => (
              <Route key={feedType} path={`/${feedType}/:page`} element={<Feed />} />
            ))}
            <Route path="/item/:id" element={<ItemDetails />} />
            <Route path="/user/:id" element={<User />} />
            <Route path="*" element={<Navigate to="/news/1" replace />} />
          </Routes>
        </Suspense>
        <Footer />
      </div>
    </div>
  );
}

export default App;
