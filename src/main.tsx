import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import { SettingsProvider } from './context/SettingsProvider';
import { router } from './routes';

import './styles/global.scss';

const container = document.getElementById('root');

if (!container) {
    throw new Error('Root container is missing from index.html');
}

createRoot(container).render(
    <StrictMode>
        <SettingsProvider>
            <RouterProvider router={router} />
        </SettingsProvider>
    </StrictMode>
);
