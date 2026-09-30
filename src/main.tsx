import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import { SettingsProvider } from './context/SettingsContext';
import { App } from './App';
import './styles.scss';

registerSW({ immediate: true });

createRoot(document.querySelector('app-root')!).render(
    <StrictMode>
        <BrowserRouter>
            <SettingsProvider>
                <App />
            </SettingsProvider>
        </BrowserRouter>
    </StrictMode>
);
