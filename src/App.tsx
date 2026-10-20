import { useEffect } from 'react';

import { AppRoutes } from './routes';
import { Header } from './core/Header';
import { Footer } from './core/Footer';
import { useSettingsStore, subscribeToSystemColorScheme } from './shared/store/settings';
import './App.scss';

/**
 * Port of `AppComponent`: the theme name is applied as a class on the app root so the
 * SCSS `theme()` mixin (`.default`, `.night`, `.amoledblack`) can style everything below.
 */
export default function App() {
    const theme = useSettingsStore((state) => state.theme);

    useEffect(() => subscribeToSystemColorScheme(), []);

    return (
        <div className={theme} data-theme={theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <Header />
                <AppRoutes />
                <Footer />
            </div>
        </div>
    );
}
