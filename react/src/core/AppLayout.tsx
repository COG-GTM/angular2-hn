import type { ReactNode } from 'react';

import { useSettings } from '../settings';
import { Footer } from './Footer';
import { Header } from './Header';
import { usePageviewTracking } from './usePageviewTracking';
import './app.scss';

export function AppLayout({ children }: { children: ReactNode }) {
    const { settings } = useSettings();
    usePageviewTracking();

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
