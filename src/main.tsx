import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './app/App';
import { registerServiceWorker } from './pwa/registerSW';
import './shared/scss/styles.scss';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>
);

registerServiceWorker();
