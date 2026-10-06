import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { useSettings } from '../settings/SettingsContext';
import { Loader } from '../components/Loader';
import { Header } from './Header';
import { Footer } from './Footer';

// Ported from src/app/app.component.html: theme class on the root drives src/styles/_themes.scss.
export function Layout() {
  const { settings } = useSettings();
  return (
    <div className={settings.theme} data-testid="theme-root">
      <div className="body-cover"></div>
      <div className="wrapper">
        <Header />
        <main id="content" tabIndex={-1}>
          <Suspense fallback={<Loader />}>
            <Outlet />
          </Suspense>
        </main>
        <Footer />
      </div>
    </div>
  );
}
