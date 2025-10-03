import { Outlet } from 'react-router-dom';
import { useSettings } from './contexts/SettingsContext';

function App() {
    const { settings } = useSettings();

    return (
        <div className={settings.theme}>
            <div className="body-cover">
                <div className="wrapper">
                    <header id="header">
                        <h1>Angular2 HN React - Infrastructure Setup</h1>
                        <p>This is Phase 1: Project foundation and testing infrastructure</p>
                    </header>
                    <main>
                        <Outlet />
                    </main>
                    <footer id="footer">
                        <p>Angular2 HN React Migration - Foundation Phase</p>
                    </footer>
                </div>
            </div>
        </div>
    );
}

export default App;
