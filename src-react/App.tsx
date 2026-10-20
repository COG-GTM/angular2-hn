import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

import { AppRoutes } from './routes';
import { queryClient } from './shared/api';
import { SettingsProvider } from './shared/settings';
import { ROUTER_FUTURE_FLAGS } from './shared/utils';

export function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <SettingsProvider>
                <BrowserRouter future={ROUTER_FUTURE_FLAGS}>
                    <AppRoutes />
                </BrowserRouter>
            </SettingsProvider>
        </QueryClientProvider>
    );
}
