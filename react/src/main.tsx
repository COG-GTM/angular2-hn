import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import './styles.scss';

function Shell() {
  const { settings } = useSettings();
  return <div className={settings.theme}><div className="body-cover" /><div className="wrapper"><Header /><App /><Footer /></div></div>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><BrowserRouter><SettingsProvider><Shell /></SettingsProvider></BrowserRouter></React.StrictMode>);
