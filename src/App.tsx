import { BrowserRouter } from 'react-router-dom';

import { AppShell } from './AppShell';
import { SettingsProvider } from './context';

export default function App() {
    return (
        <BrowserRouter>
            <SettingsProvider>
                <AppShell />
            </SettingsProvider>
        </BrowserRouter>
    );
}
