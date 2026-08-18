import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsProvider';
import { routes } from './routes';
import { registerServiceWorker } from './registerServiceWorker';
import './styles/index.scss';

const router = createBrowserRouter(routes);

registerServiceWorker();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <SettingsProvider>
            <RouterProvider router={router} />
        </SettingsProvider>
    </StrictMode>
);
