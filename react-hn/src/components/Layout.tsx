import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { settings, toggleSettings } = useSettings();
  const location = useLocation();

  const navItems = [
    { path: '/news/1', label: 'Top', feedType: 'news' },
    { path: '/newest/1', label: 'New', feedType: 'newest' },
    { path: '/show/1', label: 'Show', feedType: 'show' },
    { path: '/ask/1', label: 'Ask', feedType: 'ask' },
    { path: '/jobs/1', label: 'Jobs', feedType: 'jobs' },
  ];

  const isActiveRoute = (feedType: string) => {
    return location.pathname.startsWith(`/${feedType}`);
  };

  return (
    <div className={`app ${settings.theme}`}>
      <header className="header">
        <div className="header-content">
          <Link to="/news/1" className="logo">
            <img src="/favicon.ico" alt="React HN" width="16" height="16" />
            React HN
          </Link>
          <nav className="nav">
            {navItems.map((item) => (
              <Link
                key={item.feedType}
                to={item.path}
                className={`nav-link ${isActiveRoute(item.feedType) ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <button onClick={toggleSettings} className="settings-btn">
            Settings
          </button>
        </div>
      </header>
      <main className="main">
        {children}
      </main>
    </div>
  );
};

export default Layout;
