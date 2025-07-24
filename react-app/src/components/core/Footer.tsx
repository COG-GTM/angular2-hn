import React from 'react';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  return (
    <footer className={`bg-gray-100 text-gray-600 p-4 text-center ${className}`}>
      <div className="container mx-auto">
        <p className="text-sm">
          Built with React • Data from{' '}
          <a 
            href="https://github.com/HackerNews/API" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-orange-500 hover:text-orange-600"
          >
            Hacker News API
          </a>
        </p>
      </div>
    </footer>
  );
};
