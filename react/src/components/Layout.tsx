import { Outlet } from 'react-router';
import { useSettings } from '../hooks/useSettings';
import { Footer } from './Footer';
import { Header } from './Header';
import './Layout.css';

/** Root layout (port of app.component.html): theme class → header, routed page, footer. */
export function Layout() {
  const { settings } = useSettings();
  return (
    <div className={settings.theme} data-testid="app-root">
      <div className="body-cover" />
      <div className="wrapper">
        <Header />
        <main>
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
