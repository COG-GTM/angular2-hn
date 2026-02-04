import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SettingsProvider } from './context/SettingsContext';
import { Feed } from './pages';

// Lazy load item details and user profile pages
const ItemDetails = lazy(() => import('./pages/ItemDetails').then(module => ({ default: module.ItemDetails })));
const UserProfile = lazy(() => import('./pages/UserProfile').then(module => ({ default: module.UserProfile })));

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Loading component for Suspense fallback
function Loading() {
  return <div>Loading...</div>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <BrowserRouter>
          <Suspense fallback={<Loading />}>
            <Routes>
              {/* Default redirect to news feed */}
              <Route path="/" element={<Navigate to="/news/1" replace />} />
              
              {/* Feed routes with pagination */}
              <Route path="/news/:page" element={<Feed feedType="news" />} />
              <Route path="/newest/:page" element={<Feed feedType="newest" />} />
              <Route path="/show/:page" element={<Feed feedType="show" />} />
              <Route path="/ask/:page" element={<Feed feedType="ask" />} />
              <Route path="/jobs/:page" element={<Feed feedType="jobs" />} />
              
              {/* Item details route (lazy loaded) */}
              <Route path="/item/:id" element={<ItemDetails />} />
              
              {/* User profile route (lazy loaded) */}
              <Route path="/user/:id" element={<UserProfile />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </SettingsProvider>
    </QueryClientProvider>
  );
}

export default App;
