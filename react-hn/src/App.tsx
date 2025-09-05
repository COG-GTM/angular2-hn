import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SettingsProvider } from './contexts/SettingsContext';
import { Header } from './components/Layout/Header';
import { Footer } from './components/Layout/Footer';
import { Feed } from './components/Feed/Feed';
import { Settings } from './components/Settings/Settings';

const ItemDetails = lazy(() => import('./components/ItemDetails/ItemDetails').then(module => ({ default: module.ItemDetails })));
const User = lazy(() => import('./components/User/User').then(module => ({ default: module.User })));

function App() {
  return (
    <SettingsProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          <main className="flex-1 p-4">
            <div className="max-w-6xl mx-auto">
              <Suspense fallback={<div className="text-center py-10 text-gray-600">Loading...</div>}>
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
              </Suspense>
            </div>
          </main>
          <Footer />
          <Settings />
        </div>
      </Router>
    </SettingsProvider>
  );
}

export default App;
