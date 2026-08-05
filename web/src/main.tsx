import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';
import { SettingsProvider } from './context/SettingsContext';
import './styles/global.scss';

createRoot(document.getElementById('root') as HTMLElement).render(
    <StrictMode>
        <SettingsProvider>
            <App />
        </SettingsProvider>
    </StrictMode>
);
