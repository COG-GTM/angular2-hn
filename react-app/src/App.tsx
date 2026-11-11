import { Outlet } from 'react-router-dom';
import { Header } from './components/Header/Header';
import { Footer } from './components/Footer/Footer';
import { Settings } from './components/Settings/Settings';
import { useSettings } from './settings';
import './styles/layout.scss';

export function App() {
  const { settings } = useSettings();
  return <div className={settings.theme === 'amoled' ? 'amoledblack' : settings.theme}>
    <div className="body-cover" />
    <div className="wrapper">
      <Header />
      {settings.showSettings && <Settings />}
      <Outlet />
      <Footer />
    </div>
  </div>;
}
