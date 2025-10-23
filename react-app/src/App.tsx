import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { Feed } from './pages/Feed';
import { ItemDetails } from './pages/ItemDetails';
import { User } from './pages/User';
import './App.css';

function Navigation() {
  const { settings, setTheme } = useSettings();

  return (
    <nav className="bg-gray-100 dark:bg-gray-800 p-4 mb-4">
      <div className="container mx-auto flex gap-4 items-center">
        <Link to="/news/1" className="text-blue-600 hover:underline">News</Link>
        <Link to="/newest/1" className="text-blue-600 hover:underline">Newest</Link>
        <Link to="/show/1" className="text-blue-600 hover:underline">Show</Link>
        <Link to="/ask/1" className="text-blue-600 hover:underline">Ask</Link>
        <Link to="/jobs/1" className="text-blue-600 hover:underline">Jobs</Link>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setTheme('default')}
            className={`px-3 py-1 rounded ${settings.theme === 'default' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}
          >
            Light
          </button>
          <button
            onClick={() => setTheme('night')}
            className={`px-3 py-1 rounded ${settings.theme === 'night' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}
          >
            Dark
          </button>
        </div>
      </div>
    </nav>
  );
}

function AppContent() {
  const { settings } = useSettings();

  return (
    <div className={settings.theme === 'night' ? 'dark' : ''}>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
        <Navigation />
        <Routes>
          <Route path="/" element={<Navigate to="/news/1" replace />} />
          <Route path="/news/:page" element={<Feed />} />
          <Route path="/newest/:page" element={<Feed />} />
          <Route path="/show/:page" element={<Feed />} />
          <Route path="/ask/:page" element={<Feed />} />
          <Route path="/jobs/:page" element={<Feed />} />
          <Route path="/item/:id" element={<ItemDetails />} />
          <Route path="/user/:id" element={<User />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <AppContent />
      </SettingsProvider>
    </BrowserRouter>
  );
}

export default App;
