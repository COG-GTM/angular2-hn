import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes';
import { SettingsProvider } from './shared/settings/SettingsProvider';
import './styles.scss';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <SettingsProvider>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </SettingsProvider>
    </StrictMode>
);
