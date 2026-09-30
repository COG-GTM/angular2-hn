import './styles/global.scss';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AppRouter from './AppRouter';
import { SettingsProvider } from './settings/SettingsContext';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <SettingsProvider>
            <AppRouter />
        </SettingsProvider>
    </StrictMode>
);
