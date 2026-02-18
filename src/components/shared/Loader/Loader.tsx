import React from 'react';
import './Loader.css';

interface LoaderProps {
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({ text = 'Loading...' }) => {
  return (
    <div className="loading-section">
      <div className="loader">
        {text}
      </div>
    </div>
  );
};

export default Loader;
