import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './AppRoutes';
import { SettingsProvider } from './context';
import { createQueryClient } from './queryClient';
import { ROUTER_FUTURE_FLAGS } from './routerConfig';

export function App({ queryClient }: { queryClient?: QueryClient }) {
    const [client] = useState(() => queryClient ?? createQueryClient());
    return (
        <QueryClientProvider client={client}>
            <SettingsProvider>
                <BrowserRouter future={ROUTER_FUTURE_FLAGS}>
                    <AppRoutes />
                </BrowserRouter>
            </SettingsProvider>
        </QueryClientProvider>
    );
}
