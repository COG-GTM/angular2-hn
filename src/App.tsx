import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { SettingsProvider } from './context/SettingsContext';
import { routes } from './routes';

const router = createBrowserRouter(routes);

export default function App() {
    return (
        <SettingsProvider>
            <RouterProvider router={router} />
        </SettingsProvider>
    );
}
