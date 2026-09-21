import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { AppRoutes } from './AppRoutes';
import { useSettings } from './context';
import { usePageviews } from './usePageviews';
import './App.scss';

export function AppShell() {
    const { settings } = useSettings();

    usePageviews();

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
