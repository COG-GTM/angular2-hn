import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { SettingsProvider } from './react/context/SettingsContext';
import AppRoutes from './react/routes';
import './react/styles.scss';

const rootElement = document.getElementById('root');

if (!rootElement) {
    throw new Error('React root element was not found');
}

createRoot(rootElement).render(
    <BrowserRouter>
        <SettingsProvider>
            <AppRoutes />
        </SettingsProvider>
    </BrowserRouter>
);
