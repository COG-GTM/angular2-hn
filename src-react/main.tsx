import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';

import App from './App';
import { SettingsProvider } from './shared/settings/SettingsContext';
import './styles.scss';

registerSW({ immediate: true });

createRoot(document.getElementById('content')!).render(
    <StrictMode>
        <BrowserRouter>
            <SettingsProvider>
                <App />
            </SettingsProvider>
        </BrowserRouter>
    </StrictMode>,
);
