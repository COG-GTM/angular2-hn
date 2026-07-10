import React from 'react';
import ReactDOM from 'react-dom/client';

import { SettingsProvider, useSettings } from './context/SettingsContext';
import './styles/global.scss';

function App() {
  const { settings } = useSettings();
  return (
    <div className={settings.theme}>
      <div className="wrapper">
        <h1>Angular 2 HN</h1>
        <p>React + TypeScript migration &mdash; current theme: {settings.theme}</p>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <SettingsProvider>
      <App />
    </SettingsProvider>
  </React.StrictMode>,
);
