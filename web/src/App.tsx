import { ReactNode } from 'react';

import { useSettings } from './context/SettingsContext';
import './App.scss';

export interface AppProps {
    children?: ReactNode;
}

export function App({ children }: AppProps) {
    const { settings } = useSettings();

    return (
        <div className={settings.theme}>
            <div className="body-cover"></div>
            <div className="wrapper">{children}</div>
        </div>
    );
}

export default App;
