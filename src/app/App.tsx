import { QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';

import { createQueryClient } from '../shared/api';
import { SettingsProvider } from '../shared/settings';
import { routes } from './routes';

export function App() {
    const [queryClient] = useState(createQueryClient);
    const [router] = useState(() => createBrowserRouter(routes));
    return (
        <QueryClientProvider client={queryClient}>
            <SettingsProvider>
                <RouterProvider router={router} />
            </SettingsProvider>
        </QueryClientProvider>
    );
}
