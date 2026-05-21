import { useSettings } from '@/contexts/SettingsContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AppRoutes } from '@/routes';
import './styles/globals.scss';

export function App() {
  const { settings } = useSettings();

  return (
    <div className={settings.theme}>
      <div className="body-cover" />
      <div className="wrapper">
        <Header />
        <AppRoutes />
        <Footer />
      </div>
    </div>
  );
}
