import { lazy, Suspense } from 'react';

import { AppRoutes } from './app/routes';
import { Layout } from './core';
import { Feed } from './features/feed';
import { Loader } from './shared/components';
import { SettingsProvider } from './shared/settings/SettingsContext';

const ItemDetails = lazy(() => import('./features/item').then((module) => ({ default: module.ItemDetails })));
const UserProfile = lazy(() => import('./features/user').then((module) => ({ default: module.UserProfile })));

function App() {
    return (
        <SettingsProvider>
            <Layout>
                <Suspense fallback={<Loader />}>
                    <AppRoutes Feed={Feed} ItemDetails={ItemDetails} User={UserProfile} />
                </Suspense>
            </Layout>
        </SettingsProvider>
    );
}

export default App;
