import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { SettingsProvider } from './context';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <SettingsProvider>
            <p>React HN is being migrated.</p>
        </SettingsProvider>
    </StrictMode>
);
