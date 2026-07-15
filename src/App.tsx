import { SettingsProvider } from './context/SettingsContext';

// STUB (Task 0): Task H finalizes routing (react-router-dom v6).
export default function App() {
    return (
        <SettingsProvider>
            <div className="wrapper">
                <div id="header">
                    <h1>Angular 2 HN</h1>
                </div>
                <p>React + Vite scaffold — migration in progress.</p>
            </div>
        </SettingsProvider>
    );
}
