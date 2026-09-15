import React from 'react';
import { createRoot } from 'react-dom/client';
import { SettingsProvider } from './context/SettingsContext';
import './styles/global.scss';

createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <SettingsProvider>
            <div>Phase 1 scaffold</div>
        </SettingsProvider>
    </React.StrictMode>,
);
