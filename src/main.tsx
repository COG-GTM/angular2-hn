import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, useRoutes } from 'react-router-dom';

import { SettingsProvider } from './shared/services/settings-context';
import { routes } from './routes';

import './styles.scss';

const container = document.getElementById('root');

if (!container) {
    throw new Error('Root container #root was not found in the document');
}

function AppRoutes() {
    return useRoutes(routes);
}

createRoot(container).render(
    <React.StrictMode>
        <SettingsProvider>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </SettingsProvider>
    </React.StrictMode>
);
