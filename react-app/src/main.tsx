import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';

// Global/theme styles must load before component styles, matching Angular's cascade order.
import './styles/global.scss';

import { App } from './App';
import { SettingsProvider } from './settings/SettingsContext';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60_000,
            retry: 1,
            // Always hit fetch so the service worker can answer from its runtime cache while offline.
            networkMode: 'always',
            refetchOnWindowFocus: false,
        },
    },
});

if (import.meta.env.PROD) {
    registerSW({ immediate: true });
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <SettingsProvider>
                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <App />
                </BrowserRouter>
            </SettingsProvider>
        </QueryClientProvider>
    </StrictMode>
);
