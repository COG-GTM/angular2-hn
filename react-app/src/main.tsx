import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import { SettingsProvider } from './context/SettingsProvider';
import './styles/index.scss';

const container = document.querySelector('app-root');

if (!container) {
    throw new Error('Could not find the app-root element to mount the application.');
}

createRoot(container).render(
    <StrictMode>
        <BrowserRouter>
            <SettingsProvider>
                <App />
            </SettingsProvider>
        </BrowserRouter>
    </StrictMode>
);
