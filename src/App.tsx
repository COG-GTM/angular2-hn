import { AppRoutes } from './AppRoutes';
import { Header } from './components/core/Header';
import { Footer } from './components/core/Footer';
import { useSettings } from './context/useSettings';
import { usePageViews } from './hooks/usePageViews';
import './App.scss';

export default function App() {
  const { settings } = useSettings();
  usePageViews();

  return (
    <div className={settings.theme}>
      <div className="body-cover"></div>
      <div className="wrapper">
        <Header />
        <AppRoutes />
        <Footer />
      </div>
    </div>
  );
}
