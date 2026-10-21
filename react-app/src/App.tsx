import { Outlet } from 'react-router-dom';

import Footer from './components/core/Footer';
import Header from './components/core/Header';
import { useSettings } from './settings';
import './App.scss';

export default function App() {
  const { settings } = useSettings();
  return (
    <div className={settings.theme} data-testid="app-root">
      <div className="body-cover" />
      <div className="wrapper" id="content">
        <Header />
        <Outlet />
        <Footer />
      </div>
    </div>
  );
}
