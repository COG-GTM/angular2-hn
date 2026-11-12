import { useEffect } from 'react';
import { useLocation, useRoutes } from 'react-router-dom';

import { Footer } from './core/Footer';
import { Header } from './core/Header';
import { routes } from './routes';
import './App.scss';

declare global {
    interface Window {
        ga?: (...args: unknown[]) => void;
    }
}

function usePageviewTracking() {
    const { pathname, search } = useLocation();
    useEffect(() => {
        window.ga?.('set', 'page', pathname + search);
        window.ga?.('send', 'pageview');
    }, [pathname, search]);
}

export function App() {
    const outlet = useRoutes(routes);
    usePageviewTracking();

    return (
        <div className="app-root">
            <div className="body-cover"></div>
            <div className="wrapper">
                <Header />
                {outlet}
                <Footer />
            </div>
        </div>
    );
}
