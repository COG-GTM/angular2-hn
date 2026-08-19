import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Global themes must be emitted before the component styles that override them,
// matching the order Angular injected them in.
import './styles.scss';
import { App } from './react/App';

const container = document.querySelector('app-root');

if (container) {
    createRoot(container).render(
        <StrictMode>
            <App />
        </StrictMode>
    );
}
