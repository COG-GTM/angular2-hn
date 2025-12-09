import React from 'react';
import './Footer.css';

export const Footer: React.FC = () => {
    return (
        <footer className="main-footer">
            <div className="footer-content">
                <p>
                    Built with React 18 |{' '}
                    <a
                        href="https://github.com/nicholasbraun/angular2-hn"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Source
                    </a>
                </p>
            </div>
        </footer>
    );
};
