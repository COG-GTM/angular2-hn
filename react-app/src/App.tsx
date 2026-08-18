import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Header } from './app/core/header/Header';
import { Footer } from './app/core/footer/Footer';
import { Feed } from './app/feeds/feed/Feed';
import { useSettings } from './app/shared/context/SettingsContext';

/* item/user were lazy-loaded NgModules in the Angular app; React.lazy keeps those chunk boundaries. */
const ItemDetails = lazy(() =>
    import('./app/item-details/ItemDetails').then((module) => ({ default: module.ItemDetails }))
);
const User = lazy(() => import('./app/user/User').then((module) => ({ default: module.User })));

const FEED_TYPES = ['news', 'newest', 'show', 'ask', 'jobs'];

export default function App(): JSX.Element {
    const { settings } = useSettings();

    return (
        <div className={settings.theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <Header />
                <Suspense fallback={null}>
                    <Routes>
                        <Route path="/" element={<Navigate to="/news/1" replace />} />
                        {FEED_TYPES.map((feedType) => (
                            <Route key={feedType} path={`/${feedType}`}>
                                <Route path=":page" element={<Feed feedType={feedType} />} />
                            </Route>
                        ))}
                        <Route path="/item/:id" element={<ItemDetails />} />
                        <Route path="/user/:id" element={<User />} />
                    </Routes>
                </Suspense>
                <Footer />
            </div>
        </div>
    );
}
