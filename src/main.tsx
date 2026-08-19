import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './react/App';
import './styles.scss';

const container = document.querySelector('app-root');

if (container) {
    createRoot(container).render(
        <StrictMode>
            <App />
        </StrictMode>
    );
}
