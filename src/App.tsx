import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Settings } from './components/Settings';
import { Feed } from './components/Feed';
import { ItemDetails } from './components/ItemDetails';
import { User } from './components/User';
import { useSettingsStore } from './stores/settings';
import './styles/main.scss';

function App() {
  const { theme, initTheme } = useSettingsStore();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  useEffect(() => {
    document.body.className = `theme-${theme}`;
  }, [theme]);

  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/news/1" replace />} />
            <Route path="/news/:page" element={<Feed feedType="news" />} />
            <Route path="/newest/:page" element={<Feed feedType="newest" />} />
            <Route path="/show/:page" element={<Feed feedType="show" />} />
            <Route path="/ask/:page" element={<Feed feedType="ask" />} />
            <Route path="/jobs/:page" element={<Feed feedType="jobs" />} />
            <Route path="/item" element={<ItemDetails />} />
            <Route path="/user" element={<User />} />
          </Routes>
        </main>
        <Settings />
      </div>
    </Router>
  );
}

export default App;
