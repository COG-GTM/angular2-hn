import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { SettingsProvider } from './context/SettingsContext';
import { AppRoutes } from './routes';
import './styles/global.scss';

createRoot(document.getElementById('root') as HTMLElement).render(
    <StrictMode>
        <SettingsProvider>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </SettingsProvider>
    </StrictMode>
);
