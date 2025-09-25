import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { SettingsProvider } from './contexts/SettingsContext';
import FeedDemo from './components/FeedDemo';
import SettingsDemo from './components/SettingsDemo';
import UserDemo from './components/UserDemo';
import './App.css';

function App() {
  return (
    <SettingsProvider>
      <Router>
        <div className="app">
          <nav className="nav">
            <h1>React HN Client - Phase 1 Demo</h1>
            <div className="nav-links">
              <Link to="/">Feed Demo</Link>
              <Link to="/settings">Settings Demo</Link>
              <Link to="/user">User Demo</Link>
            </div>
          </nav>
          
          <main className="main">
            <Routes>
              <Route path="/" element={<FeedDemo />} />
              <Route path="/settings" element={<SettingsDemo />} />
              <Route path="/user" element={<UserDemo />} />
            </Routes>
          </main>
        </div>
      </Router>
    </SettingsProvider>
  );
}

export default App;
