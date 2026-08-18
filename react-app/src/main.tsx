import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { SettingsProvider } from './app/shared/context/SettingsContext';
import App from './App';
import './styles.scss';

const container = document.getElementById('root');
if (!container) {
    throw new Error('Root container is missing in index.html');
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
