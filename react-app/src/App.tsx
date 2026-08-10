import type { ReactNode } from 'react';
import { Footer } from './core/Footer';
import { Header } from './core/Header';
import { useSettings } from './shared/settings/useSettings';
import './App.scss';

export function App({ children }: { children: ReactNode }) {
    const { settings } = useSettings();

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
