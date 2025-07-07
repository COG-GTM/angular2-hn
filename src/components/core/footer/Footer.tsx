import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 text-gray-600 p-4 mt-8">
      <div className="container mx-auto text-center">
        <p>
          Built with React • Inspired by{' '}
          <a 
            href="https://news.ycombinator.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-orange-500 hover:underline"
          >
            Hacker News
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
