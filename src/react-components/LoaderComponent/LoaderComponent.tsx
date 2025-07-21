import React from 'react';
import { LoaderComponentProps } from './LoaderComponent.types';
import './LoaderComponent.css';

export const LoaderComponent: React.FC<LoaderComponentProps> = ({ className }) => {
  return (
    <div className={`loading-section ${className || ''}`}>
      <div className="loader">
        Loading...
      </div>
    </div>
  );
};
