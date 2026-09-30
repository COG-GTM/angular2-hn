// Port of AppComponent. OWNER: Session 4 (app shell) — keep the root structure below.
import { Outlet } from 'react-router-dom';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { useSettings } from './settings/SettingsContext';
import './App.scss';

export function App() {
  const { settings } = useSettings();
  return (
    <div className={settings.theme}>
      <div className="body-cover"></div>
      <div className="wrapper">
        <Header />
        <Outlet />
        <Footer />
      </div>
    </div>
  );
}
