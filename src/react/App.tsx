import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';

import '../app/app.component.scss';
import { Footer } from './core/Footer';
import { Feed } from './feeds/Feed';
import { ItemDetails } from './item-details/ItemDetails';
import { Header } from './core/Header';
import { content, host } from './scope';
import { SettingsProvider, useSettings } from './settings/SettingsContext';

declare const ga: undefined | ((...args: unknown[]) => void);

const c = content('app');

const feedTypes = ['news', 'newest', 'show', 'ask', 'jobs'];

function usePageViews() {
    const location = useLocation();

    useEffect(() => {
        if (location.pathname === '/') {
            return;
        }

        if (typeof ga === 'function') {
            ga('set', 'page', location.pathname + location.search);
            ga('send', 'pageview');
        }
    }, [location.pathname, location.search]);
}

function Shell() {
    const { settings } = useSettings();

    usePageViews();

    return (
        <div className={settings.theme} {...c}>
            <div className="body-cover" {...c}></div>
            <div className="wrapper" {...c}>
                <app-header {...c} {...host('header')}>
                    <Header />
                </app-header>
                <router-outlet {...c}></router-outlet>
                <Routes>
                    <Route path="/" element={<Navigate to="/news/1" replace />} />
                    {feedTypes.map(feedType => (
                        <Route
                            key={feedType}
                            path={`/${feedType}/:page`}
                            element={
                                <app-feed {...c} {...host('feed')}>
                                    <Feed key={feedType} feedType={feedType} />
                                </app-feed>
                            }
                        />
                    ))}
                    <Route
                        path="/item/:id"
                        element={
                            <app-item-details {...c} {...host('item-details')}>
                                <ItemDetails />
                            </app-item-details>
                        }
                    />
                    <Route path="/user/:id" element={null} />
                </Routes>
                <app-footer {...c} {...host('footer')}>
                    <Footer />
                </app-footer>
            </div>
        </div>
    );
}

export function App() {
    return (
        <SettingsProvider>
            <BrowserRouter>
                <Shell />
            </BrowserRouter>
        </SettingsProvider>
    );
}
