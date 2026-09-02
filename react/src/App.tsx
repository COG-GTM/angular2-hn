import { lazy } from 'react';

import { AppLayout } from './core';
import { Feed } from './feed';
import { AppRoutes } from './routes';
import { SettingsProvider } from './settings';
import { Loader } from './shared/components';

const ItemDetails = lazy(() => import('./item-details').then((m) => ({ default: m.ItemDetails })));
const UserProfile = lazy(() => import('./user').then((m) => ({ default: m.UserProfile })));

export default function App() {
    return (
        <SettingsProvider>
            <AppLayout>
                <AppRoutes feedPage={Feed} itemPage={ItemDetails} userPage={UserProfile} fallback={<Loader />} />
            </AppLayout>
        </SettingsProvider>
    );
}
