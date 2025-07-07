import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSettings } from '../../shared/contexts/SettingsContext';

const Header: React.FC = () => {
  const { settings, toggleSettings } = useSettings();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <header className="bg-orange-500 text-white p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link to="/news/1" className="text-xl font-bold">
            HN
          </Link>
          <nav className="flex space-x-4">
            <Link 
              to="/news/1" 
              className={`hover:underline ${isActive('/news') ? 'font-bold' : ''}`}
            >
              News
            </Link>
            <Link 
              to="/newest/1" 
              className={`hover:underline ${isActive('/newest') ? 'font-bold' : ''}`}
            >
              New
            </Link>
            <Link 
              to="/show/1" 
              className={`hover:underline ${isActive('/show') ? 'font-bold' : ''}`}
            >
              Show
            </Link>
            <Link 
              to="/ask/1" 
              className={`hover:underline ${isActive('/ask') ? 'font-bold' : ''}`}
            >
              Ask
            </Link>
            <Link 
              to="/jobs/1" 
              className={`hover:underline ${isActive('/jobs') ? 'font-bold' : ''}`}
            >
              Jobs
            </Link>
          </nav>
        </div>
        <button 
          onClick={toggleSettings}
          className="hover:bg-orange-600 p-2 rounded"
        >
          Settings
        </button>
      </div>
    </header>
  );
};

export default Header;
