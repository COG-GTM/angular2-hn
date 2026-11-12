import { Footer } from './core/Footer';
import { Header } from './core/Header';
import { AppRoutes } from './AppRoutes';
import { useSettings } from './shared/settings/useSettings';
import { usePageViewTracking } from './shared/utils/analytics';
import './App.scss';

export function App() {
    const { settings } = useSettings();
    usePageViewTracking();

    return (
        <div className={settings.theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <Header />
                <AppRoutes />
                <Footer />
            </div>
        </div>
    );
}
