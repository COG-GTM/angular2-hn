import Footer from './core/Footer';
import Header from './core/Header';
import { usePageViews } from './core/usePageViews';
import AppRoutes from './router/AppRoutes';
import { useSettings } from './shared/settings/useSettings';
import './App.scss';

export default function App() {
    const settings = useSettings();
    usePageViews();

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
