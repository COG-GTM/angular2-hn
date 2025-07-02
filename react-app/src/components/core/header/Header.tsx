import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Header: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(`/${path}`);
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/news/1" className="logo">
          <img src="/assets/logo.png" alt="HN" />
          Hacker News
        </Link>
        <nav className="nav">
          <Link to="/news/1" className={isActive('news') ? 'active' : ''}>
            News
          </Link>
          <Link to="/newest/1" className={isActive('newest') ? 'active' : ''}>
            New
          </Link>
          <Link to="/show/1" className={isActive('show') ? 'active' : ''}>
            Show
          </Link>
          <Link to="/ask/1" className={isActive('ask') ? 'active' : ''}>
            Ask
          </Link>
          <Link to="/jobs/1" className={isActive('jobs') ? 'active' : ''}>
            Jobs
          </Link>
        </nav>
      </div>
    </header>
  );
};
