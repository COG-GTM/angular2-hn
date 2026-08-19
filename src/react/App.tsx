import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';

import '../app/app.component.scss';
import { content } from './scope';
import { SettingsProvider, useSettings } from './settings/SettingsContext';

declare const ga: undefined | ((...args: unknown[]) => void);

const c = content('app');

const feedTypes = ['news', 'newest', 'show', 'ask', 'jobs'];

function usePageViews() {
    const location = useLocation();

    useEffect(() => {
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
                <router-outlet {...c}></router-outlet>
                <Routes>
                    <Route path="/" element={<Navigate to="/news/1" replace />} />
                    {feedTypes.map(feedType => (
                        <Route key={feedType} path={`/${feedType}/:page`} element={null} />
                    ))}
                    <Route path="/item/:id" element={null} />
                    <Route path="/user/:id" element={null} />
                </Routes>
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
