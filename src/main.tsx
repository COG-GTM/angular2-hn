import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { SettingsProvider } from './settings';
import { AppRoutes } from './routes';
import { RouteAnalytics } from './components/RouteAnalytics';
import './styles/global.scss';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><BrowserRouter><RouteAnalytics /><SettingsProvider><AppRoutes /></SettingsProvider></BrowserRouter></React.StrictMode>,
);
