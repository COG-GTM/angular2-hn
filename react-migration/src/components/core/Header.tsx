import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../hooks/useSettings';

const Header: React.FC = () => {
  const { toggleSettings } = useSettings();

  return (
    <header className="header">
      <nav className="nav">
        <Link to="/news/1" className="nav-link">News</Link>
        <Link to="/newest/1" className="nav-link">New</Link>
        <Link to="/show/1" className="nav-link">Show</Link>
        <Link to="/ask/1" className="nav-link">Ask</Link>
        <Link to="/jobs/1" className="nav-link">Jobs</Link>
      </nav>
      <button onClick={toggleSettings} className="settings-button">
        Settings
      </button>
    </header>
  );
};

export default Header;
