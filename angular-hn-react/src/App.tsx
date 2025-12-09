import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { SettingsProvider } from './hooks/useSettings';
import { AppRouter } from './AppRouter';
import './App.css';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
        },
    },
});

export const App = () => (
    <QueryClientProvider client={queryClient}>
        <SettingsProvider>
            <BrowserRouter>
                <AppRouter />
            </BrowserRouter>
        </SettingsProvider>
    </QueryClientProvider>
);

export default App;
