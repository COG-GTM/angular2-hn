import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import { router } from './router';
import './styles/styles.scss';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <SettingsProvider>
            <RouterProvider router={router} />
        </SettingsProvider>
    </StrictMode>
);
