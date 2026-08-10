import { Suspense, lazy, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import Header from './core/header/header.component';
import Footer from './core/footer/footer.component';
import Feed from './feeds/feed/feed.component';
import Loader from './shared/components/loader/loader.component';
import { useSettings } from './shared/services/settings-context';
import './app.component.scss';

const ItemDetails = lazy(() => import('./item-details/item-details.component'));
const UserProfile = lazy(() => import('./user/user.component'));

declare let ga: (...args: unknown[]) => void;

export default function App() {
    const { settings } = useSettings();
    const location = useLocation();

    useEffect(() => {
        if (location.pathname === '/') {
            return;
        }
        if (typeof ga === 'function') {
            ga('set', 'page', location.pathname + location.search);
            ga('send', 'pageview');
        }
    }, [location]);

    return (
        <div className={settings.theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <Header />
                <Suspense fallback={<Loader />}>
                    <Routes>
                        <Route path="/" element={<Navigate to="/news/1" replace />} />
                        <Route path="/news/:page" element={<Feed key="news" feedType="news" />} />
                        <Route path="/newest/:page" element={<Feed key="newest" feedType="newest" />} />
                        <Route path="/show/:page" element={<Feed key="show" feedType="show" />} />
                        <Route path="/ask/:page" element={<Feed key="ask" feedType="ask" />} />
                        <Route path="/jobs/:page" element={<Feed key="jobs" feedType="jobs" />} />
                        <Route path="/item/:id" element={<ItemDetails />} />
                        <Route path="/user/:id" element={<UserProfile />} />
                    </Routes>
                </Suspense>
                <Footer />
            </div>
        </div>
    );
}
