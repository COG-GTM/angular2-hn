import { Routes, Route, Navigate } from 'react-router-dom';
import { SettingsProvider } from './contexts/SettingsContext';
import Header from './components/core/Header';
import Footer from './components/core/Footer';
import Settings from './components/core/Settings';
import Feed from './pages/Feed';
import ItemDetails from './pages/ItemDetails';
import User from './pages/User';
import './App.css';

function App() {
  return (
    <SettingsProvider>
      <div className="app">
        <Header />
        <Settings />
        
        <main className="main-content">
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
        </main>
        
        <Footer />
      </div>
    </SettingsProvider>
  );
}

export default App;
