// Port of AppComponent.
import { Outlet } from 'react-router-dom';
// Imported before any component so theme rules precede component styles in the cascade, as in Angular.
import './styles/global.scss';
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
