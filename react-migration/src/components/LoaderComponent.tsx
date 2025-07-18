import React from 'react';
import './LoaderComponent.css';

const LoaderComponent: React.FC = () => {
  return (
    <div className="loading-section">
      <div className="loader">
        Loading...
      </div>
    </div>
  );
};

export default LoaderComponent;
