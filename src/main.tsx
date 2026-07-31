import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';
import { SettingsProvider } from './context/SettingsProvider';

import './styles/global.scss';

const container = document.getElementById('root');

if (!container) {
    throw new Error('Root container is missing from index.html');
}

createRoot(container).render(
    <StrictMode>
        <SettingsProvider>
            <App />
        </SettingsProvider>
    </StrictMode>
);
