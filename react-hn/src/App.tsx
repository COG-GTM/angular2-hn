import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FeedComponent, ItemDetailsComponent, UserComponent } from './components/shared/PlaceholderComponents';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-orange-500 text-white p-4">
          <h1 className="text-2xl font-bold">React Hacker News</h1>
          <p className="text-sm opacity-90">Phase 1: Foundation Setup Complete</p>
        </header>
        
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex space-x-8 py-3">
              <a href="/news/1" className="text-gray-700 hover:text-orange-500">News</a>
              <a href="/newest/1" className="text-gray-700 hover:text-orange-500">Newest</a>
              <a href="/show/1" className="text-gray-700 hover:text-orange-500">Show</a>
              <a href="/ask/1" className="text-gray-700 hover:text-orange-500">Ask</a>
              <a href="/jobs/1" className="text-gray-700 hover:text-orange-500">Jobs</a>
            </div>
          </div>
        </nav>

        <main className="max-w-6xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Navigate to="/news/1" replace />} />
            <Route path="/news/:page" element={<FeedComponent />} />
            <Route path="/newest/:page" element={<FeedComponent />} />
            <Route path="/show/:page" element={<FeedComponent />} />
            <Route path="/ask/:page" element={<FeedComponent />} />
            <Route path="/jobs/:page" element={<FeedComponent />} />
            <Route path="/item/:id" element={<ItemDetailsComponent />} />
            <Route path="/user/:id" element={<UserComponent />} />
          </Routes>
        </main>

        <footer className="bg-gray-100 text-center py-4 mt-8">
          <p className="text-gray-600 text-sm">
            React Hacker News - Phase 1 Migration Complete
          </p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
