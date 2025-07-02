import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>Built with React 18 - Migration from Angular</p>
        <p>
          <a href="https://github.com/COG-GTM/angular2-hn" target="_blank" rel="noopener noreferrer">
            View on GitHub
          </a>
        </p>
      </div>
    </footer>
  );
};
