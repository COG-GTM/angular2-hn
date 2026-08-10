import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { registerSW } from 'virtual:pwa-register';

import './styles.scss';
import App from './app/App';
import { SettingsProvider } from './app/shared/services/settings-context';

if (import.meta.env.PROD) {
    registerSW({ immediate: true });
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <BrowserRouter>
            <SettingsProvider>
                <App />
            </SettingsProvider>
        </BrowserRouter>
    </React.StrictMode>
);
