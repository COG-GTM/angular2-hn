import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import { SettingsProvider } from './shared/settings/SettingsProvider';
import './styles/global.scss';

const container = document.getElementById('root');

if (!container) {
    throw new Error('Root container #root was not found in the document.');
}

ReactDOM.createRoot(container).render(
    <React.StrictMode>
        <BrowserRouter>
            <SettingsProvider>
                <App />
            </SettingsProvider>
        </BrowserRouter>
    </React.StrictMode>
);
