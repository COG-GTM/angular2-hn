import { Outlet } from 'react-router-dom';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { Header } from './core/Header';
import { Footer } from './core/Footer';
import styles from './App.module.scss';

function AppLayout() {
    const settings = useSettings();

    return (
        <div className={settings.theme}>
            <div className={`body-cover ${styles['body-cover']}`}></div>
            <div className={`wrapper ${styles.wrapper}`}>
                <Header />
                <Outlet />
                <Footer />
            </div>
        </div>
    );
}

function App() {
    return (
        <SettingsProvider>
            <AppLayout />
        </SettingsProvider>
    );
}

export default App;
