import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';

// Lazy load components for code splitting (similar to Angular's lazy loading)
const Feed = lazy(() => import('./routes/Feed'));
const ItemDetails = lazy(() => import('./routes/ItemDetails'));
const User = lazy(() => import('./routes/User'));

// Loading component
const Loading = () => (
  <div className="app-loader">
    <img className="logo" src="/logo.svg" alt="Logo" />
  </div>
);

function App() {
  return (
    <div className="app">
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Default redirect to /news/1 */}
          <Route path="/" element={<Navigate to="/news/1" replace />} />

          {/* Feed routes - equivalent to Angular's feedRoutes */}
          <Route path="/news/:page" element={<Feed feedType="news" />} />
          <Route path="/newest/:page" element={<Feed feedType="newest" />} />
          <Route path="/show/:page" element={<Feed feedType="show" />} />
          <Route path="/ask/:page" element={<Feed feedType="ask" />} />
          <Route path="/jobs/:page" element={<Feed feedType="jobs" />} />

          {/* Lazy-loaded routes - equivalent to Angular's loadChildren */}
          <Route path="/item/:id" element={<ItemDetails />} />
          <Route path="/user/:id" element={<User />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
