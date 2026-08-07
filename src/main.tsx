import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import { registerServiceWorker } from './pwa';
import './styles.scss';

const container = document.getElementById('root');

if (container) {
    createRoot(container).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}

registerServiceWorker(import.meta.env.PROD);
