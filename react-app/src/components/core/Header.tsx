import React from 'react';
import { useSettings } from '../../hooks/useSettings';

interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const { toggleSettings } = useSettings();

  const scrollTop = () => {
    window.scrollTo(0, 0);
  };

  return (
    <header className={`bg-orange-500 text-white p-4 ${className}`}>
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 
            className="text-xl font-bold cursor-pointer hover:text-orange-200"
            onClick={scrollTop}
          >
            Hacker News
          </h1>
          <nav className="hidden md:flex space-x-4">
            <a href="/news/1" className="hover:text-orange-200">news</a>
            <a href="/newest/1" className="hover:text-orange-200">newest</a>
            <a href="/show/1" className="hover:text-orange-200">show</a>
            <a href="/ask/1" className="hover:text-orange-200">ask</a>
            <a href="/jobs/1" className="hover:text-orange-200">jobs</a>
          </nav>
        </div>
        <button
          onClick={toggleSettings}
          className="p-2 hover:bg-orange-600 rounded"
          aria-label="Toggle settings"
        >
          ⚙️
        </button>
      </div>
    </header>
  );
};
