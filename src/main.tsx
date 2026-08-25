import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import { App } from './App';
import { SettingsProvider } from './context/SettingsContext';
import './styles.scss';

registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <SettingsProvider>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </SettingsProvider>
    </StrictMode>,
);
