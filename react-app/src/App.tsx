import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { SettingsProvider } from './contexts/SettingsContext';
import AppRoutes from './routes/AppRoutes';
import './App.css';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <div className="app">
          <AppRoutes />
        </div>
      </SettingsProvider>
    </BrowserRouter>
  );
};

export default App;
