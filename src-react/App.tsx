import { useSettings } from './shared/settings/SettingsContext';
import Footer from './core/footer/Footer';
import Header from './core/header/Header';
import './App.scss';

function App() {
    const { settings } = useSettings();

    return (
        <div className={settings.theme}>
            <div className="body-cover" />
            <div className="wrapper">
                <Header />
                <div />
                <Footer />
            </div>
        </div>
    );
}

export default App;
