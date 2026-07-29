import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { SettingsProvider } from './shared/context';
import { router } from './routes';
import './styles.scss';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <SettingsProvider>
            <RouterProvider router={router} />
        </SettingsProvider>
    </StrictMode>
);
