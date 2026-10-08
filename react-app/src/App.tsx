import { QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';

import { createQueryClient } from './query-client';
import { routes } from './router';
import { SettingsProvider } from './shared/context/SettingsProvider';

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
