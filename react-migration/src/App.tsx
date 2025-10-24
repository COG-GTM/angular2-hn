import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import Feed from './pages/Feed';
import { environment } from './config/environment';

const ItemDetails = lazy(() => import('./pages/ItemDetails'));
const UserProfile = lazy(() => import('./pages/UserProfile'));

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-orange-500 text-white shadow-md">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-bold">Hacker News React</h1>
              <div className="flex gap-4 text-sm">
                <Link to="/news/1" className="hover:underline">News</Link>
                <Link to="/newest/1" className="hover:underline">Newest</Link>
                <Link to="/show/1" className="hover:underline">Show</Link>
                <Link to="/ask/1" className="hover:underline">Ask</Link>
                <Link to="/jobs/1" className="hover:underline">Jobs</Link>
              </div>
              <span className="ml-auto text-xs">
                {environment.production ? 'Production' : 'Development'} Mode
              </span>
            </div>
          </div>
        </nav>

        <Suspense fallback={
          <div className="flex items-center justify-center h-screen">
            <div className="text-lg">Loading...</div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<Navigate to="/news/1" replace />} />
            <Route path="/news/:page" element={<Feed feedType="news" />} />
            <Route path="/newest/:page" element={<Feed feedType="newest" />} />
            <Route path="/show/:page" element={<Feed feedType="show" />} />
            <Route path="/ask/:page" element={<Feed feedType="ask" />} />
            <Route path="/jobs/:page" element={<Feed feedType="jobs" />} />
            <Route path="/item/:id" element={<ItemDetails />} />
            <Route path="/user/:id" element={<UserProfile />} />
          </Routes>
        </Suspense>
      </div>
    </BrowserRouter>
  );
}

export default App;
