import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import './styles.scss';
import { routes } from './routes';
import { createQueryClient } from './shared/query-client';
import { SettingsProvider } from './shared/settings/SettingsProvider';

const router = createBrowserRouter(routes);
const queryClient = createQueryClient();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <SettingsProvider>
                <RouterProvider router={router} />
            </SettingsProvider>
        </QueryClientProvider>
    </StrictMode>
);
