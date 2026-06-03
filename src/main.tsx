import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import { SettingsProvider } from './context/SettingsContext';
import './styles/styles.scss';

const container = document.getElementById('root');
if (!container) {
    throw new Error('Root container #root not found');
}

createRoot(container).render(
    <StrictMode>
        <SettingsProvider>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </SettingsProvider>
    </StrictMode>
);
