import { Outlet } from 'react-router-dom';
import { useSettings } from '../settings/useSettings';
import { Header } from './Header/Header';
import { Footer } from './Footer/Footer';
import { usePageviews } from './usePageviews';
import '../styles/app.scss';

export function AppShell() {
  const { theme } = useSettings();
  usePageviews();
  return (
    <div className={theme}>
      <div className="body-cover"></div>
      <div className="wrapper">
        <Header />
        <Outlet />
        <Footer />
      </div>
    </div>
  );
}
