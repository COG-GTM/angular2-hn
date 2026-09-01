import { ReactNode } from 'react';

import { useSettings } from '../shared/settings/SettingsContext';
import { Footer } from './Footer';
import { Header } from './Header';
import { useGoogleAnalytics } from './useGoogleAnalytics';
import './Layout.scss';

export function Layout({ children }: { children: ReactNode }) {
    const { settings } = useSettings();

    useGoogleAnalytics();

    return (
        <div className={settings.theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <Header />
                {children}
                <Footer />
            </div>
        </div>
    );
}
